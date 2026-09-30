package com.realty.market.controller;

import com.realty.market.model.WhatIf;
import com.realty.market.service.ModelClient;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Runs a what-if comparison: prices a base property and a modified scenario, and returns the difference.
 */
@RestController
@RequestMapping("/api")
public class WhatIfController {

    private final ModelClient modelClient;

    public WhatIfController(ModelClient modelClient) {
        this.modelClient = modelClient;
    }

    @PostMapping("/what-if")
    public WhatIf.Response whatIf(@Valid @RequestBody WhatIf.Request request) {
        List<Double> prices = modelClient.predict(List.of(request.base(), request.scenario()));

        double base = prices.get(0);
        double scenario = prices.get(1);
        double diff = scenario - base;
        double pct = base == 0 ? 0 : diff / base * 100.0;

        return new WhatIf.Response(round2(base), round2(scenario), round2(diff), round2(pct));
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}