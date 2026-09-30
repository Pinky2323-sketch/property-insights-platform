package com.realty.market.controller;

import com.realty.market.model.MarketStats.GroupStat;
import com.realty.market.model.MarketStats.Summary;
import com.realty.market.model.Property;
import com.realty.market.model.PropertyFilter;
import com.realty.market.service.MarketService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * REST endpoints for market statistics: summary, grouped breakdowns, and the raw property list.
 */
@RestController
@RequestMapping("/api")
public class MarketController {

    private final MarketService service;

    public MarketController(MarketService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/market/summary")
    public Summary summary(PropertyFilter filter) {
        return service.summary(filter);
    }

    @GetMapping("/market/by-bedrooms")
    public List<GroupStat> byBedrooms(PropertyFilter filter) {
        return service.byBedrooms(filter);
    }

    @GetMapping("/market/by-age-band")
    public List<GroupStat> byAgeBand(PropertyFilter filter) {
        return service.byAgeBand(filter);
    }

    @GetMapping("/market/properties")
    public List<Property> properties(PropertyFilter filter) {
        return service.properties(filter);
    }
}