package com.example.photo_painter.service;

import com.example.photo_painter.model.Picture;
import com.example.photo_painter.repository.PictureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Profile("dev")
public class LocalFileStorageService implements StorageService {

    private final PictureRepository pictureRepository;
    private final Path storageLocation;

    @Value("${app.base-url:http://localhost:8082/api/photo-painter}")
    private String baseUrl;

    public LocalFileStorageService(PictureRepository pictureRepository) {
        this.pictureRepository = pictureRepository;
        this.storageLocation = Paths.get(System.getProperty("user.home"))
                .resolve("photo-painter-uploads");
    }

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(storageLocation);
    }

    @Override
    public String save(UUID userId, List<MultipartFile> files) throws IOException {
        Path userDir = storageLocation.resolve(userId.toString());
        Files.createDirectories(userDir);

        StringBuilder urls = new StringBuilder();

        for (MultipartFile file : files) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = userDir.resolve(fileName);

            file.transferTo(filePath.toFile());
            log.info("File saved to: {}", filePath);

            String imageUrl = String.format("%s/images/%s/%s", baseUrl, userId, fileName);
            pictureRepository.save(new Picture(userId, fileName, imageUrl));

            log.info("Saved image URL to DB: {}", imageUrl);

            if (urls.length() > 0) {
                urls.append(",");
            }
            urls.append(imageUrl);
        }

        return urls.toString();
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
}