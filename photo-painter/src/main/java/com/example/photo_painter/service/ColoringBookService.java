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

@Slf4j
@Service
@RequiredArgsConstructor
public class ColoringBookService {

    private final OpenAiImageModel imageModel;
    private final RestClient restClient;
    private final StorageService storageService;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;


    public String generateColoringPage(UUID userId) throws IOException {

        List<String> imageUrls = storageService.listUserImages(userId);


        byte[] imageBytes = Files.readAllBytes(Path.of("C:\\Users\\shsad\\photo-painter-uploads\\bac0c2ec-2568-4437-b35a-1ab2297ac689\\ac59e5e1-1efc-4320-8e59-b6217ffb1a93_download.jpeg"));

        // Create multipart body builder
        MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
        bodyBuilder.part("model", "gpt-image-1");
        //bodyBuilder.part("prompt", "Create a black and white coloring book style of the picture");
        bodyBuilder.part("prompt", """
                Make this a page in a colouring book.\s
                The drawing is in a simple Studio Ghibli portrait style.\s
                Bleed all the way to the edges.\s
                Background colour is hashtag#ffffff and lines are bold and #000000.\s
                There is no shading or crossthatching.
                """);

        // Add all images from URLs
        for (String imageUrl : imageUrls) {
            MultipartFile file = storageService.getFile(imageUrl);
            if (file != null) {
                bodyBuilder.part("image[]", new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename();
                    }
                });
            }
        }

        // Build the multipart body
        MultiValueMap<String, HttpEntity<?>> multipartBody = bodyBuilder.build();

        // Make request to OpenAI API
        String response = restClient.post()
                .uri("https://api.openai.com/v1/images/edits" + "nadananan")
                .header("Authorization", "Bearer " + apiKey)
                .body(multipartBody)
                .retrieve()
                .body(String.class);

        // Parse response and get base64 image data
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);
        String base64Image = root.path("data").get(0).path("b64_json").asText();

        // Convert base64 to byte array
        byte[] imageData = Base64.getDecoder().decode(base64Image);

        // Save to file
        String outputFileName = UUID.randomUUID() + "_coloring.png";
        Path outputPath = Path.of(System.getProperty("user.home"))
                .resolve("photo-painter-uploads")
                .resolve(outputFileName);

        Files.write(outputPath, imageData);
        log.info("Saved coloring page to: {}", outputPath);

        return outputPath.toString();
    }
}
