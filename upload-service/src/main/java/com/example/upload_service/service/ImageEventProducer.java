package com.example.upload_service.service;

import com.example.upload_service.config.KafkaConfig;
import com.example.upload_service.event.ImagesUploadCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageEventProducer {

    private final KafkaTemplate<String, ImagesUploadCompletedEvent> kafkaTemplate;

    public void publishImagesUploadCompletedEvent(ImagesUploadCompletedEvent event) {
        log.info("Publishing IMAGES_UPLOAD_COMPLETED event for userId: {}, totalImages: {}",
                event.userId(), event.totalImages());

        try {
            CompletableFuture<SendResult<String, ImagesUploadCompletedEvent>> future =
                    kafkaTemplate.send(KafkaConfig.IMAGES_UPLOAD_COMPLETED_TOPIC,
                            event.userId().toString(),
                            event);

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("Successfully sent IMAGES_UPLOAD_COMPLETED event for userId: {} with offset: {}",
                            event.userId(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to send IMAGES_UPLOAD_COMPLETED event for userId: {}. Error: {}",
                            event.userId(), ex.getMessage());
                    log.warn("Application will continue without Kafka. Please ensure Kafka is running at configured bootstrap servers.");
                }
            });
        } catch (Exception e) {
            log.error("Exception while sending IMAGES_UPLOAD_COMPLETED event for userId: {}. Error: {}",
                    event.userId(), e.getMessage());
            log.warn("Kafka might not be available. Application will continue without event publishing.");
        }
    }
}

