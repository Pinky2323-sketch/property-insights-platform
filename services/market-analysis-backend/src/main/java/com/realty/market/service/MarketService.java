package com.realty.market.service;

import com.realty.market.model.MarketStats.GroupStat;
import com.realty.market.model.MarketStats.Summary;
import com.realty.market.model.Property;
import com.realty.market.model.PropertyFilter;
import com.realty.market.repository.PropertyRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Computes market statistics (summary, grouped by bedrooms/age) from the property list,
 * with results cached per filter.
 */
@Service
public class MarketService {

    private static final Logger log = LoggerFactory.getLogger(MarketService.class);

    private final PropertyRepository repository;

    public MarketService(PropertyRepository repository) {
        this.repository = repository;
    }

    private List<Property> filtered(PropertyFilter filter) {
        return repository.findAll().stream().filter(filter::matches).toList();
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    public List<Property> properties(PropertyFilter filter) {
        return filtered(filter);
    }

    @Cacheable(cacheNames = "summary", key = "#filter")
    public Summary summary(PropertyFilter filter) {
        List<Property> list = filtered(filter);
        log.info("Computing summary for {} properties (filter: {})", list.size(), filter);
        
        if (list.isEmpty()) {
            return new Summary(0, 0, 0, 0, 0, 0, 0);
        }

        double[] prices = list.stream().mapToDouble(Property::price).sorted().toArray();
        int n = prices.length;
        double median = n % 2 == 1
                ? prices[n / 2]
                : (prices[n / 2 - 1] + prices[n / 2]) / 2.0;

        double totalPrice = list.stream().mapToDouble(Property::price).sum();
        double totalSqft = list.stream().mapToDouble(Property::squareFootage).sum();

        return new Summary(
                n,
                round2(totalPrice / n),
                round2(median),
                prices[0],
                prices[n - 1],
                round2(totalSqft / n),
                round2(totalPrice / totalSqft));
    }

    @Cacheable(cacheNames = "byBedrooms", key = "#filter")
    public List<GroupStat> byBedrooms(PropertyFilter filter) {
        Map<Integer, List<Property>> groups = filtered(filter).stream()
                .collect(Collectors.groupingBy(Property::bedrooms, TreeMap::new, Collectors.toList()));

        List<GroupStat> result = new ArrayList<>();
        groups.forEach((beds, list) -> result.add(toGroup(beds + " bed", list)));
        return result;
    }

    @Cacheable(cacheNames = "byAgeBand", key = "#filter")
    public List<GroupStat> byAgeBand(PropertyFilter filter) {
        List<String> order = List.of("Before 1985", "1985-1994", "1995-2004", "2005 or later");
        Function<Property, String> band = p -> {
            int y = p.yearBuilt();
            if (y < 1985) return order.get(0);
            if (y < 1995) return order.get(1);
            if (y < 2005) return order.get(2);
            return order.get(3);
        };

        Map<String, List<Property>> groups = filtered(filter).stream()
                .collect(Collectors.groupingBy(band));

        List<GroupStat> result = new ArrayList<>();
        for (String label : order) {          // keep the bands in age order
            List<Property> list = groups.get(label);
            if (list != null) result.add(toGroup(label, list));
        }
        return result;
    }

    private GroupStat toGroup(String label, List<Property> list) {
        double avg = list.stream().mapToDouble(Property::price).average().orElse(0);
        return new GroupStat(label, list.size(), round2(avg));
    }
}