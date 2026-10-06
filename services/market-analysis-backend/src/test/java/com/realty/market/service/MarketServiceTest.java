package com.realty.market.service;

import com.realty.market.model.MarketStats.GroupStat;
import com.realty.market.model.MarketStats.Summary;
import com.realty.market.model.Property;
import com.realty.market.model.PropertyFilter;
import com.realty.market.repository.PropertyRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;


class MarketServiceTest {

    private static final PropertyFilter NO_FILTER = new PropertyFilter(null, null, null, null, null);

    private static Property house(int id, int bedrooms, double price) {
        return new Property(id, 1000.0, bedrooms, 1.0, 2000, 5000.0, 3.0, 7.0, price);
    }

    private final PropertyRepository repository = () -> List.of(
            house(1, 2, 100_000.0),
            house(2, 3, 200_000.0),
            house(3, 3, 300_000.0));

    private final MarketService service = new MarketService(repository);

    @Test
    void summaryCoversAllProperties() {
        Summary s = service.summary(NO_FILTER);

        assertEquals(3, s.count());
        assertEquals(200_000.0, s.avgPrice());
        assertEquals(200_000.0, s.medianPrice());
        assertEquals(100_000.0, s.minPrice());
        assertEquals(300_000.0, s.maxPrice());
    }

    @Test
    void bedroomFilterNarrowsTheSegment() {
        Summary s = service.summary(new PropertyFilter(null, null, 3, null, null));

        assertEquals(2, s.count());
        assertEquals(250_000.0, s.avgPrice());
    }

    @Test
    void filterMatchingNothingGivesEmptySummary() {
        Summary s = service.summary(new PropertyFilter(999_999.0, null, null, null, null));

        assertEquals(0, s.count());
    }

    @Test
    void groupsByBedroomCount() {
        List<GroupStat> groups = service.byBedrooms(NO_FILTER);

        assertEquals(2, groups.size());
        assertEquals("2 bed", groups.get(0).label());
        assertEquals(1, groups.get(0).count());
        assertEquals("3 bed", groups.get(1).label());
        assertEquals(250_000.0, groups.get(1).avgPrice());
    }
}