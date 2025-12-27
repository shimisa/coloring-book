package com.example.upload_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.kafka.common.errors.SerializationException;
import org.apache.kafka.common.serialization.Serializer;

/**
 * Custom JSON serializer for Kafka messages.
 * Compatible with Spring Kafka 4.0+ (replaces deprecated JsonSerializer)
 */
public class EventJsonSerializer<T> implements Serializer<T> {

    private final ObjectMapper objectMapper;

    public EventJsonSerializer() {
        this.objectMapper = new ObjectMapper();
        // Register JavaTimeModule for LocalDateTime serialization
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public byte[] serialize(String topic, T data) {
        if (data == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsBytes(data);
        } catch (Exception e) {
            throw new SerializationException("Error serializing JSON message for topic: " + topic, e);
        }
    }

    @Override
    public void close() {
        // No resources to close
    }
}

