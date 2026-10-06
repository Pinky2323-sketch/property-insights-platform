package com.realty.market.service;

import com.realty.market.model.PropertyFeatures;
import com.realty.market.model.WhatIf;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Compares the price of a base property with a changed version of it.
 */
@Service
public class WhatIfService {

    private final ModelPredictor predictor;

    public WhatIfService(ModelPredictor predictor) {
        this.predictor = predictor;
    }

    public WhatIf.Response compare(PropertyFeatures base, PropertyFeatures scenario) {
        List<Double> prices = predictor.predict(List.of(base, scenario));

        double basePrice = prices.get(0);
        double scenarioPrice = prices.get(1);
        double difference = scenarioPrice - basePrice;
        double percentChange = basePrice == 0 ? 0 : difference / basePrice * 100.0;

        return new WhatIf.Response(
                round2(basePrice),
                round2(scenarioPrice),
                round2(difference),
                round2(percentChange));
    }

    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}