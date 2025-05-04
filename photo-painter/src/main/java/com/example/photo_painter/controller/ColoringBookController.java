package com.example.photo_painter.controller;

import com.example.photo_painter.service.ColoringBookService;
import com.example.photo_painter.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ColoringBookController {

    private final StorageService storageService;
    private final ColoringBookService coloringBookService;

    @PostMapping("/generate-coloring-book")
    public ResponseEntity<byte[]> generate(@RequestParam UUID userId) throws IOException {
        List<String> imageUrls = storageService.listUserImages(userId);
        byte[] result = coloringBookService.generateColoringBook(imageUrls);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=coloring-book.png")
                .contentType(MediaType.IMAGE_PNG)
                .body(result);
    }
}
