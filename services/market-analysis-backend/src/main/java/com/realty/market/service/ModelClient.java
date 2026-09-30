package com.realty.market.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.realty.market.model.PropertyFeatures;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Calls the model API to get price predictions.
 */
@Component
public class ModelClient {

    private static final Logger log = LoggerFactory.getLogger(ModelClient.class);

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ModelResponse(List<Double> predictions) {}

    private final RestClient client;

    public ModelClient(@Value("${model.api.url}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(10000);
        this.client = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    
    public List<Double> predict(List<PropertyFeatures> properties) {
        List<Map<String, Object>> body = properties.stream().map(ModelClient::toModelJson).toList();

        log.info("Requesting predictions for {} properties", properties.size());

        try {
            ModelResponse response = client.post()
                    .uri("/predict")
                    .body(body)
                    .retrieve()
                    .body(ModelResponse.class);

            if (response == null || response.predictions() == null
                    || response.predictions().size() != properties.size()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Model API returned an unexpected response");
            }
            return response.predictions();

        } catch (ResourceAccessException e) {
            log.error("Cannot reach the model API", e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Cannot reach the prediction model API. Is it running?");
        } catch (RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Model API returned " + e.getStatusCode().value());
        }
    }

    
    private static Map<String, Object> toModelJson(PropertyFeatures p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("square_footage", p.squareFootage());
        m.put("bedrooms", p.bedrooms());
        m.put("bathrooms", p.bathrooms());
        m.put("year_built", p.yearBuilt());
        m.put("lot_size", p.lotSize());
        m.put("distance_to_city_center", p.distanceToCityCenter());
        m.put("school_rating", p.schoolRating());
        return m;
    }
}