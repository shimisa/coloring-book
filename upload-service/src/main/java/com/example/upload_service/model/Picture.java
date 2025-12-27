package com.example.upload_service.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pictures")
public class Picture {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private String originalFilename;

    @Column
    private String filePath;

    @Column
    private Long fileSize;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    public Picture() {}

    public Picture(UUID userId, String originalFilename, String imageUrl) {
        this.userId = userId;
        this.originalFilename = originalFilename;
        this.imageUrl = imageUrl;
        this.uploadedAt = LocalDateTime.now();
    }

    public Picture(UUID userId, String originalFilename, String imageUrl, String filePath, Long fileSize) {
        this.userId = userId;
        this.originalFilename = originalFilename;
        this.imageUrl = imageUrl;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters and setters
    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getImageUrl() { return imageUrl; }
    public String getOriginalFilename() { return originalFilename; }
    public String getFilePath() { return filePath; }
    public Long getFileSize() { return fileSize; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
