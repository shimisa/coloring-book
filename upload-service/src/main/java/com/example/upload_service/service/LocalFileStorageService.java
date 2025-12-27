package com.example.upload_service.service;

import com.example.upload_service.model.Picture;
import com.example.upload_service.repository.ImageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Profile("dev")
public class LocalFileStorageService extends AbstractStorageService {

    private final Path storageLocation;

    @Value("${app.base-url:http://localhost:8083/api/upload-service}")
    private String baseUrl;

    public LocalFileStorageService(ImageRepository imageRepository, ImageEventProducer imageEventProducer) {
        super(imageRepository, imageEventProducer);
        // Cross-platform compatible path: works on both Windows and Linux
        this.storageLocation = Paths.get(System.getProperty("user.home"), "photo-painter-uploads");
    }

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(storageLocation);
    }

    @Override
    protected Picture saveFile(UUID userId, MultipartFile file) throws IOException {
        Path userDir = storageLocation.resolve(userId.toString());
        Files.createDirectories(userDir);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = userDir.resolve(fileName);

        file.transferTo(filePath.toFile());
        log.info("File saved to: {}", filePath);

        String imageUrl = String.format("%s/images/%s/%s", baseUrl, userId, fileName);
        long fileSize = Files.size(filePath);

        return new Picture(userId, file.getOriginalFilename(), imageUrl, filePath.toString(), fileSize);
    }

    @Override
    public List<String> listUserImages(UUID userId) {
        Path userDir = storageLocation.resolve(userId.toString());
        if (!Files.exists(userDir)) {
            return List.of();
        }

        File[] files = userDir.toFile().listFiles();
        if (files == null) {
            return List.of();
        }

        return Arrays.stream(files)
                .filter(File::isFile)
                .map(file -> String.format("%s/images/%s/%s",
                        baseUrl,
                        userId,
                        file.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public MultipartFile getFile(String url) {
        try {
            String fileName = url.substring(url.lastIndexOf('/') + 1);
            String userId = url.substring(url.indexOf("/images/") + 8, url.lastIndexOf('/'));
            Path filePath = storageLocation.resolve(userId).resolve(fileName);



            if (!Files.exists(filePath)) {
                return null;
            }

            return new MultipartFile() {
                @Override
                public String getName() {
                    return fileName;
                }

                @Override
                public String getOriginalFilename() {
                    return fileName;
                }

                @Override
                public String getContentType() {
                    try {
                        return Files.probeContentType(filePath);
                    } catch (IOException e) {
                        return "application/octet-stream";
                    }
                }

                @Override
                public boolean isEmpty() {
                    return false;
                }

                @Override
                public long getSize() {
                    try {
                        return Files.size(filePath);
                    } catch (IOException e) {
                        return 0;
                    }
                }

                @Override
                public byte[] getBytes() throws IOException {
                    return Files.readAllBytes(filePath);
                }

                @Override
                public InputStream getInputStream() throws IOException {
                    return Files.newInputStream(filePath);
                }

                @Override
                public void transferTo(File dest) throws IOException {
                    Files.copy(filePath, dest.toPath(), StandardCopyOption.REPLACE_EXISTING);
                }
            };
        } catch (Exception e) {
            log.error("Error retrieving file: {}", url, e);
            return null;
        }
    }
}