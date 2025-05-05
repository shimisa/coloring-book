package com.example.photo_painter.controller;

import com.example.photo_painter.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/images")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ImageController {

    private final StorageService storageService;

    @PostMapping("/upload-multiple")
    public ResponseEntity<List<UploadResponse>> uploadImages(@RequestParam("images") List<MultipartFile> files) throws IOException {
        String imageUrls = storageService.save(UUID.randomUUID(), files);
        List<UploadResponse> responses = Arrays.stream(imageUrls.split(","))
                .map(UploadResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<String>> getUserImages(@PathVariable UUID userId) {
        return ResponseEntity.ok(storageService.listUserImages(userId));
    }

    public record UploadResponse(String url) {}
}
