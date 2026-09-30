package com.realty.market.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public final class WhatIf {

    private WhatIf() {}

    public record Request(
            @NotNull @Valid PropertyFeatures base,
            @NotNull @Valid PropertyFeatures scenario) {}

    public record Response(
            double basePrice,
            double scenarioPrice,
            double difference,
            double percentChange) {}
}