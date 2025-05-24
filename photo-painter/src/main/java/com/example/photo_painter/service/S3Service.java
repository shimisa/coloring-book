package com.example.photo_painter.service;

import com.example.photo_painter.model.Picture;
import com.example.photo_painter.repository.PictureRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
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

    @Override
    public String save(UUID userId, List<MultipartFile> files) throws IOException {
        StringBuilder urls = new StringBuilder();

        for (MultipartFile file : files) {
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

            if (urls.length() > 0) {
                urls.append(",");
            }
            urls.append(imageUrl);
        }

        return urls.toString();
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

    @Override
    public MultipartFile getFile(String url) {
        try {
            String key = url.substring(url.indexOf(".com/") + 5);
            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(
                    GetObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build()
            );

            byte[] content = objectBytes.asByteArray();
            String fileName = key.substring(key.lastIndexOf('/') + 1);

            return new MultipartFile() {
                @Override
                public String getName() {
                    return fileName;
                }

                @Override
                public String getOriginalFilename() {
                    return fileName;
                }

                @Override
                public String getContentType() {
                    return objectBytes.response().contentType();
                }

                @Override
                public boolean isEmpty() {
                    return content.length == 0;
                }

                @Override
                public long getSize() {
                    return content.length;
                }

                @Override
                public byte[] getBytes() {
                    return content;
                }

                @Override
                public InputStream getInputStream() {
                    return new ByteArrayInputStream(content);
                }

                @Override
                public void transferTo(File dest) throws IOException {
                    Files.write(dest.toPath(), content);
                }
            };
        } catch (Exception e) {
            log.error("Error retrieving file from S3: {}", url, e);
            return null;
        }
    }
}
