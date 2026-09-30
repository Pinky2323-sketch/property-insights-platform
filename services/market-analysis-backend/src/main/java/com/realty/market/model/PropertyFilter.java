package com.realty.market.model;

public record PropertyFilter(
        Double minPrice,
        Double maxPrice,
        Integer bedrooms,
        Double minSqft,
        Double maxSqft) {

    public boolean matches(Property p) {
        return (minPrice == null || p.price() >= minPrice)
                && (maxPrice == null || p.price() <= maxPrice)
                && (bedrooms == null || p.bedrooms() == bedrooms)
                && (minSqft == null || p.squareFootage() >= minSqft)
                && (maxSqft == null || p.squareFootage() <= maxSqft);
    }
}