package com.example.photo_painter.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface StorageService {
    String save(UUID userId, List<MultipartFile> files) throws IOException;
    List<String> listUserImages(UUID userId);
    MultipartFile getFile(String url);
}
