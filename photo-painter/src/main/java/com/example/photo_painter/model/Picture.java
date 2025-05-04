package com.example.photo_painter.model;



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

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    public Picture() {}

    public Picture(UUID userId, String originalFilename, String imageUrl) {
        this.userId = userId;
        this.originalFilename = originalFilename;
        this.imageUrl = imageUrl;
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters and setters omitted for brevity

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getImageUrl() { return imageUrl; }
    public String getOriginalFilename() { return originalFilename; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
