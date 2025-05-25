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
                    .thenRunAsync(() -> {
                        try {
                            log.info("All images processed for user: {}", userId);
                            // todo: async completion logic
                            // e.g. send notification, update status
                        } catch (Exception e) {
                            log.error("Error in completion handler: {}", e.getMessage(), e);
                        }

                    })
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

        try {
            byte[] imageData = callOpenAiApi(file);
            saveImageToFile(imageData, userId);
        } catch (Exception e) {
            log.error("Error processing image {}: {}", imageUrl, e.getMessage());
            throw new RuntimeException("Failed to process image: " + e.getMessage(), e);
        }
    }

    private byte[] callOpenAiApi(MultipartFile file) throws IOException {
        MultiValueMap<String, HttpEntity<?>> multipartBody = createMultipartBody(file);
        String response = makeApiRequest(multipartBody);
        return processApiResponse(response);
    }

    private MultiValueMap<String, HttpEntity<?>> createMultipartBody(MultipartFile file) throws IOException {
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("model", "gpt-image-1");
        bodyBuilder.part("prompt", """
        Make this a page in a colouring book.\s
        The drawing is in a simple Studio Ghibli portrait style.\s
        Bleed all the way to the edges.\s
        Background colour is hashtag#ffffff and lines are bold and #000000.\s
        There is no shading or crossthatching.
        """);

        ByteArrayResource fileBytes = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        bodyBuilder.part("image", fileBytes);
        return bodyBuilder.build();
    }

    private String makeApiRequest(MultiValueMap<String, HttpEntity<?>> multipartBody) {
        return restClient.post()
                .uri("https://api.openai.com/v1/images/edits")
                .header("Authorization", "Bearer " + apiKey)
                .body(multipartBody)
                .retrieve()
                .body(String.class);
    }

    private byte[] processApiResponse(String response) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);

        if (root.has("error")) {
            String errorMessage = root.path("error").path("message").asText();
            throw new RuntimeException("OpenAI API error: " + errorMessage);
        }

        String base64Image = root.path("data").get(0).path("b64_json").asText();
        return Base64.getDecoder().decode(base64Image);
    }

    private void saveImageToFile(byte[] imageData, UUID userId) throws IOException {
        Path outputPath = Path.of(System.getProperty("user.home"))
                .resolve("photo-painter-uploads")
                .resolve(userId.toString())
                .resolve("coloring_book")
                .resolve(UUID.randomUUID() + "_coloring.png");

        Files.createDirectories(outputPath.getParent());
        try (var outputStream = Files.newOutputStream(outputPath)) {
            outputStream.write(imageData);
            log.info("Saved coloring page to: {}", outputPath);
        }
    }
}
