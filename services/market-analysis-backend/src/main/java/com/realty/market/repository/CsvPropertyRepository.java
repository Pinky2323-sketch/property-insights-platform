
package com.realty.market.repository;

import com.realty.market.model.Property;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads the housing dataset CSV once at startup and keeps it in memory.
 */
@Repository
public class CsvPropertyRepository implements PropertyRepository {

    private static final Logger log = LoggerFactory.getLogger(CsvPropertyRepository.class);
    private static final String CSV_PATH = "House_Price_Dataset.csv";
    private static final int EXPECTED_COLUMNS = 9;

    private List<Property> properties = List.of();

    @PostConstruct
    void load() {
        log.info("Loading properties from {}", CSV_PATH);
        List<Property> loaded = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource(CSV_PATH).getInputStream(), StandardCharsets.UTF_8))) {

            String header = reader.readLine();
            if (header == null) {
                throw new IllegalStateException(CSV_PATH + " is empty");
            }
            
            header = header.replace("\uFEFF", "");
            if (header.split(",").length != EXPECTED_COLUMNS) {
                throw new IllegalStateException("Unexpected header: " + header);
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) continue;
                loaded.add(parse(line, lineNumber));
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read " + CSV_PATH, e);
        }

        this.properties = List.copyOf(loaded);
        log.info("Loaded {} properties from {}", properties.size(), CSV_PATH);
    }

    private Property parse(String line, int lineNumber) {
        String[] c = line.split(",");
        if (c.length != EXPECTED_COLUMNS) {
            throw new IllegalStateException("Line " + lineNumber + " has " + c.length + " columns");
        }
        try {
            return new Property(
                    Integer.parseInt(c[0].trim()),
                    Double.parseDouble(c[1].trim()),
                    Integer.parseInt(c[2].trim()),
                    Double.parseDouble(c[3].trim()),
                    Integer.parseInt(c[4].trim()),
                    Double.parseDouble(c[5].trim()),
                    Double.parseDouble(c[6].trim()),
                    Double.parseDouble(c[7].trim()),
                    Double.parseDouble(c[8].trim()));
        } catch (NumberFormatException e) {
            throw new IllegalStateException("Bad number on line " + lineNumber + ": " + line, e);
        }
    }

    @Override
    public List<Property> findAll() {
        return properties;
    }
}