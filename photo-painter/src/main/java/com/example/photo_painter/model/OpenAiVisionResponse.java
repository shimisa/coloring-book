package com.example.photo_painter.model;

import lombok.Data;

import java.util.List;

@Data
public class OpenAiVisionResponse {
    private List<Choice> choices;

    public String getDescriptionText() {
        return choices.get(0).getMessage().getContent();
    }

    @Data
    public static class Choice {
        private Message message;
    }

    @Data
    public static class Message {
        private String content;
    }
}
