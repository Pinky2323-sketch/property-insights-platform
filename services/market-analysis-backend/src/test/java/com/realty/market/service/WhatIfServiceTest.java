
package com.realty.market.service;

import com.realty.market.model.PropertyFeatures;
import com.realty.market.model.WhatIf;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WhatIfServiceTest {

    private static final PropertyFeatures HOUSE =
            new PropertyFeatures(1850.0, 3, 2.0, 1998, 7500.0, 5.6, 8.2);

    @Test
    void computesDifferenceAndPercentChange() {
        WhatIfService service = new WhatIfService(properties -> List.of(100_000.0, 110_000.0));

        WhatIf.Response result = service.compare(HOUSE, HOUSE);

        assertEquals(100_000.0, result.basePrice());
        assertEquals(110_000.0, result.scenarioPrice());
        assertEquals(10_000.0, result.difference());
        assertEquals(10.0, result.percentChange());
    }

    @Test
    void negativeDifferenceWhenScenarioIsCheaper() {
        WhatIfService service = new WhatIfService(properties -> List.of(200_000.0, 150_000.0));

        WhatIf.Response result = service.compare(HOUSE, HOUSE);

        assertEquals(-50_000.0, result.difference());
        assertEquals(-25.0, result.percentChange());
    }

    @Test
    void zeroBasePriceDoesNotDivideByZero() {
        WhatIfService service = new WhatIfService(properties -> List.of(0.0, 50_000.0));

        WhatIf.Response result = service.compare(HOUSE, HOUSE);

        assertEquals(0.0, result.percentChange());
    }
}