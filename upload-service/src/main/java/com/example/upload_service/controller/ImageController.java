package com.example.upload_service.controller;

import com.example.upload_service.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
public class ImageController {

    private final StorageService storageService;

    public ImageController(StorageService storageService) {
        this.storageService = storageService;
    }

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

    @GetMapping("/{userId}/{fileName}")
    public ResponseEntity<Resource> getImage(@PathVariable UUID userId, @PathVariable String fileName) throws IOException {
        String url = String.format("http://localhost:8083/api/upload-service/images/%s/%s", userId, fileName);
        MultipartFile file = storageService.getFile(url);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new InputStreamResource(file.getInputStream());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getOriginalFilename() + "\"")
                .body(resource);
    }

    public record UploadResponse(String url) {}
}
