package com.example.photo_painter.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.openai.OpenAiImageModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.MultiValueMap;

import java.util.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;


@Slf4j
@Service
@RequiredArgsConstructor
public class ColoringBookService {

    private final OpenAiImageModel imageModel;
    private final RestClient restClient;
    private final StorageService storageService;
    private final Executor executor;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    public void generateColoringPage(UUID userId) {
        try {
            List<String> imageUrls = storageService.listUserImages(userId);
            List<CompletableFuture<Void>> futures = new ArrayList<>();

            // Create a virtual thread for each image
            for (String imageUrl : imageUrls) {
                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    try {
                        processImage(imageUrl, userId);
                    } catch (Exception e) {
                        log.error("Error processing image {}: {}", imageUrl, e.getMessage(), e);
                    }
                }, executor);
                futures.add(future);
            }

            // Non-blocking wait for all futures
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .exceptionally(throwable -> {
                        log.error("Error processing images: {}", throwable.getMessage(), throwable);
                        return null;
                    });

        } catch (Exception e) {
            log.error("Failed to start image processing: {}", e.getMessage(), e);
        }
    }

    private void processImage(String imageUrl, UUID userId) throws IOException {
        MultipartFile file = storageService.getFile(imageUrl);
        if (file == null) {
            throw new RuntimeException("File not found: " + imageUrl);
        }

        // Create multipart body builder
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("model", "gpt-image-1");
        bodyBuilder.part("prompt", """
            Make this a page in a colouring book.\s
            The drawing is in a simple Studio Ghibli portrait style.\s
            Bleed all the way to the edges.\s
            Background colour is hashtag#ffffff and lines are bold and #000000.\s
            There is no shading or crossthatching.
            """);

        // Add single image
        bodyBuilder.part("image", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        MultiValueMap<String, HttpEntity<?>> multipartBody = bodyBuilder.build();

        try {
            // Make request to OpenAI API
            String response = restClient.post()
                    .uri("https://api.openai.com/v1/images/edits")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(multipartBody)
                    .retrieve()
                    .body(String.class);

            // Parse response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            // Check for errors
            if (root.has("error")) {
                String errorMessage = root.path("error").path("message").asText();
                throw new RuntimeException("OpenAI API error: " + errorMessage);
            }

            // Process response
            String base64Image = root.path("data").get(0).path("b64_json").asText();
            byte[] imageData = Base64.getDecoder().decode(base64Image);

            // Save to file
            String outputFileName = UUID.randomUUID() + "_coloring.png";
            Path outputPath = Path.of(System.getProperty("user.home"))
                    .resolve("photo-painter-uploads")
                    .resolve(userId.toString())
                    .resolve("coloring_book")
                    .resolve(outputFileName);

            Files.createDirectories(outputPath.getParent());
            Files.write(outputPath, imageData);
            log.info("Saved coloring page to: {}", outputPath);

        } catch (Exception e) {
            log.error("Error processing image {}: {}", imageUrl, e.getMessage());
            throw new RuntimeException("Failed to process image: " + e.getMessage(), e);
        }
    }
}
