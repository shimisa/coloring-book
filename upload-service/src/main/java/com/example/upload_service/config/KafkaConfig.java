package com.example.upload_service.config;

import com.example.upload_service.event.ImagesUploadCompletedEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka configuration for Upload Service.
 *
 * Defines KafkaTemplate and topic configuration.
 */
@Configuration
public class KafkaConfig {

    public static final String IMAGES_UPLOAD_COMPLETED_TOPIC = "images-upload-completed";

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    /**
     * Configure the Kafka producer factory with serializers and settings.
     */
    @Bean
    public ProducerFactory<String, ImagesUploadCompletedEvent> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();

        // Bootstrap servers
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);

        // Serializers
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, EventJsonSerializer.class);

        // Reliability settings
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        configProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);

        // Performance settings
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 1);
        configProps.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);

        // Timeout configurations
        configProps.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
        configProps.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 10000);
        configProps.put(ProducerConfig.MAX_BLOCK_MS_CONFIG, 5000);
        configProps.put(ProducerConfig.RECONNECT_BACKOFF_MS_CONFIG, 500);
        configProps.put(ProducerConfig.RECONNECT_BACKOFF_MAX_MS_CONFIG, 5000);

        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * Configure KafkaTemplate for sending messages.
     */
    @Bean
    public KafkaTemplate<String, ImagesUploadCompletedEvent> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    /**
     * Define the Kafka topic for images upload completed events.
     */
    @Bean
    public NewTopic imagesUploadCompletedTopic() {
        return TopicBuilder.name(IMAGES_UPLOAD_COMPLETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}

