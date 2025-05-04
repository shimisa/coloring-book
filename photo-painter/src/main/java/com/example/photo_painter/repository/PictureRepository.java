package com.example.photo_painter.repository;

import com.example.photo_painter.model.Picture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PictureRepository extends JpaRepository<Picture, UUID> {
}
