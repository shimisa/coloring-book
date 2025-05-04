package com.example.photo_painter.service;

import com.example.photo_painter.model.Picture;
import com.example.photo_painter.repository.PictureRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Profile("prod")  // Active only in production
public class S3Service implements StorageService{

    @Value("${aws.s3.bucket}")
    private String bucket;

    private final PictureRepository pictureRepository;

    private final S3Client s3Client = S3Client.builder()
            .region(Region.US_EAST_1)
            .build();

    public String save(UUID userId, MultipartFile file) throws IOException {
        String key = "user-uploads/" + userId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .acl(ObjectCannedACL.PUBLIC_READ)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
        String imageUrl = "https://" + bucket + ".s3.amazonaws.com/" + key;
        pictureRepository.save(new Picture(userId, file.getOriginalFilename(), imageUrl));
        return imageUrl;
    }

    @Override
    public List<String> listUserImages(UUID userId) {
        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(bucket)
                .prefix("user-uploads/" + userId + "/")
                .build();

        ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
        return listResponse.contents().stream()
                .map(obj -> "https://" + bucket + ".s3.amazonaws.com/" + obj.key())
                .collect(Collectors.toList());
    }
}
