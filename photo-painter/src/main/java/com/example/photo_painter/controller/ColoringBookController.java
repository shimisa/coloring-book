package com.example.photo_painter.controller;

import com.example.photo_painter.service.ColoringBookService;
import com.example.photo_painter.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ColoringBookController {

    private final StorageService storageService;
    private final ColoringBookService coloringBookService;

    @PostMapping("/generate-coloring-book")
    public ResponseEntity<String> generate(@RequestParam UUID userId) throws IOException {
        String result = coloringBookService.generateColoringPage(userId);
        return ResponseEntity.ok()
                .body(result);
    }
}
