package com.example.upload_service.event;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record ImagesUploadCompletedEvent(
        UUID userId,
        List<ImageInfo> images,
        LocalDateTime uploadedAt,
        int totalImages
) {
    @Builder
    public record ImageInfo(
            UUID imageId,
            String imageUrl,
            String originalFilename,
            String filePath,
            long fileSize
    ) {}
}

