package com.example.upload_service.repository;

import com.example.upload_service.model.Picture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ImageRepository extends JpaRepository<Picture, UUID> {
}
