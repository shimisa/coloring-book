package com.example.photo_painter.service;

import com.example.photo_painter.model.Picture;
import com.example.photo_painter.repository.PictureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Profile("dev")  // Only active in dev profile
@RequiredArgsConstructor
public class LocalFileStorageService implements StorageService {

    private final PictureRepository pictureRepository;
    private static final String BASE_DIR = "uploads/";

    @Override
    public String save(UUID userId, MultipartFile file) throws IOException {
        String userDir = BASE_DIR + userId + "/";
        File dir = new File(userDir);
        if (!dir.exists()) dir.mkdirs();

        String filePath = userDir + file.getOriginalFilename();
        file.transferTo(new File(filePath));

        String imageUrl = "http://localhost:8080/" + filePath; // Local URL for development
        pictureRepository.save(new Picture(userId, file.getOriginalFilename(), imageUrl));
        return filePath;
    }

    @Override
    public List<String> listUserImages(UUID userId) {
        File userDir = new File(BASE_DIR + userId);
        if (!userDir.exists()) return List.of();

        return Arrays.stream(userDir.listFiles())
                .map(File::getAbsolutePath)
                .collect(Collectors.toList());
    }
}
