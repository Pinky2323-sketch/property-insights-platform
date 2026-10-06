package com.realty.market.model;

public final class MarketStats {

    private MarketStats() {}

    public record Summary(
            int count,
            double avgPrice,
            double medianPrice,
            double minPrice,
            double maxPrice,
            double avgSquareFootage,
            double avgPricePerSqft) {}

    public record GroupStat(String label, int count, double avgPrice) {}
}