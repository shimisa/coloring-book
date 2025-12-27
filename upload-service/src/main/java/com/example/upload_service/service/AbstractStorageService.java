package com.example.upload_service.service;

import com.example.upload_service.event.ImagesUploadCompletedEvent;
import com.example.upload_service.model.Picture;
import com.example.upload_service.repository.ImageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
public abstract class AbstractStorageService implements StorageService {

    protected final ImageRepository imageRepository;
    protected final ImageEventProducer imageEventProducer;

    @Value("${file.max-size-bytes:10485760}")
    protected long maxFileSizeBytes;

    protected AbstractStorageService(ImageRepository imageRepository, ImageEventProducer imageEventProducer) {
        this.imageRepository = imageRepository;
        this.imageEventProducer = imageEventProducer;
    }

    @Override
    public String save(UUID userId, List<MultipartFile> files) throws IOException {
        StringBuilder urls = new StringBuilder();
        List<Picture> savedPictures = new ArrayList<>();
        LocalDateTime uploadTime = LocalDateTime.now();

        for (MultipartFile file : files) {
            validateFile(file);

            Picture picture = saveFile(userId, file);
            savedPictures.add(imageRepository.save(picture));

            if (urls.length() > 0) {
                urls.append(",");
            }
            urls.append(picture.getImageUrl());
        }

        publishEvent(userId, uploadTime, savedPictures);

        return urls.toString();
    }

    protected void validateFile(MultipartFile file) throws IOException {
        if (file.getSize() > maxFileSizeBytes) {
            String errorMsg = String.format(
                    "File '%s' exceeds maximum size of %d bytes (%.2f MB). Actual size: %d bytes (%.2f MB)",
                    file.getOriginalFilename(),
                    maxFileSizeBytes,
                    maxFileSizeBytes / (1024.0 * 1024.0),
                    file.getSize(),
                    file.getSize() / (1024.0 * 1024.0));
            log.error(errorMsg);
            throw new IOException(errorMsg);
        }

        if (file.isEmpty()) {
            String errorMsg = String.format("File '%s' is empty", file.getOriginalFilename());
            log.error(errorMsg);
            throw new IOException(errorMsg);
        }
    }

    protected void publishEvent(UUID userId, LocalDateTime uploadTime, List<Picture> savedPictures) {
        if (!savedPictures.isEmpty()) {
            ImagesUploadCompletedEvent event = ImagesUploadCompletedEvent.builder()
                    .userId(userId)
                    .uploadedAt(uploadTime)
                    .totalImages(savedPictures.size())
                    .images(savedPictures.stream()
                            .map(picture -> ImagesUploadCompletedEvent.ImageInfo.builder()
                                    .imageId(picture.getId())
                                    .imageUrl(picture.getImageUrl())
                                    .originalFilename(picture.getOriginalFilename())
                                    .filePath(picture.getFilePath())
                                    .fileSize(picture.getFileSize())
                                    .build())
                            .collect(Collectors.toList()))
                    .build();

            imageEventProducer.publishImagesUploadCompletedEvent(event);
            log.info("Published IMAGES_UPLOAD_COMPLETED event for userId: {} with {} images",
                    userId, savedPictures.size());
        }
    }

    /**
     * Save a file to the storage backend and return a Picture object with metadata.
     * @param userId The user ID
     * @param file The file to save
     * @return Picture object with file metadata
     * @throws IOException if an error occurs during file saving
     */
    protected abstract Picture saveFile(UUID userId, MultipartFile file) throws IOException;
}

