package com.example.photo_painter.controller;

import com.example.photo_painter.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
public class ImageController {

    private final StorageService storageService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam UUID userId,
                                              @RequestParam MultipartFile file) throws IOException {
        String imageUrl = storageService.save(userId, file);
        return ResponseEntity.ok(imageUrl);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<String>> getUserImages(@PathVariable UUID userId) {
        return ResponseEntity.ok(storageService.listUserImages(userId));
    }
}
