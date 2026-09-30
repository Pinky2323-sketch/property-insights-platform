package com.realty.market;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
class MarketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthReturnsOk() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void summaryCoversAllFiftyProperties() throws Exception {
        mockMvc.perform(get("/api/market/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(50))
                .andExpect(jsonPath("$.avgPrice").value(264600.0))
                .andExpect(jsonPath("$.medianPrice").value(245000.0));
    }

    @Test
    void bedroomFilterNarrowsTheSegment() throws Exception {
        mockMvc.perform(get("/api/market/summary").param("bedrooms", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(22));
    }

    @Test
    void filterThatMatchesNothingReturnsZeroCount() throws Exception {
        mockMvc.perform(get("/api/market/summary").param("minPrice", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    void groupedStatsAreReturnedPerBedroomCount() throws Exception {
        mockMvc.perform(get("/api/market/by-bedrooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].label").value("2 bed"))
                .andExpect(jsonPath("$[0].count").value(13));
    }

    @Test
    void propertiesEndpointReturnsAllRows() throws Exception {
        mockMvc.perform(get("/api/market/properties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(50));
    }

    @Test
    void whatIfRejectsInvalidInputWithFieldErrors() throws Exception {
        String invalid = """
                {
                  "base": {"squareFootage":1850,"bedrooms":3,"bathrooms":2,"yearBuilt":1998,
                           "lotSize":7500,"distanceToCityCenter":5.6,"schoolRating":15},
                  "scenario": {"squareFootage":2100,"bedrooms":4,"bathrooms":2.5,"yearBuilt":1998,
                               "lotSize":7500,"distanceToCityCenter":5.6,"schoolRating":8.2}
                }
                """;

        mockMvc.perform(post("/api/what-if")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"))
                .andExpect(jsonPath("$.fields").value(hasKey("base.schoolRating")));
    }
}