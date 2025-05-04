package com.example.photo_painter.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ColoringBookService {

    @Value("${openai.api.key}")
    private String openAiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public byte[] generateColoringBook(List<String> imageUrls) {
        String prompt = createPromptFromImages(imageUrls);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ImageGenerationRequest request = new ImageGenerationRequest("gpt-image-1", prompt);
        HttpEntity<ImageGenerationRequest> httpEntity = new HttpEntity<>(request, headers);

        ResponseEntity<ImageGenerationResponse> response = restTemplate.exchange(
                "https://api.openai.com/v1/images/generations",
                HttpMethod.POST,
                httpEntity,
                ImageGenerationResponse.class
        );

        String base64Image = response.getBody().data[0].b64_json;
        return Base64.getDecoder().decode(base64Image);
    }

    private String createPromptFromImages(List<String> imageUrls) {
        return "Create a children's coloring book-style drawing that combines elements of a family enjoying time together. Focus on outlines only, no shading or colors.";
    }

    private record ImageGenerationRequest(String model, String prompt) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ImageGenerationResponse {
        public Data[] data;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Data {
            @JsonProperty("b64_json")
            public String b64_json;
        }
    }
}
