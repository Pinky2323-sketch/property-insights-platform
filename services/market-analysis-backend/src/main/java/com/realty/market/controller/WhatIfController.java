package com.realty.market.controller;

import com.realty.market.model.WhatIf;
import com.realty.market.service.WhatIfService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HTTP entry point for what-if comparisons.
 */
@RestController
@RequestMapping("/api")
public class WhatIfController {

    private final WhatIfService service;

    public WhatIfController(WhatIfService service) {
        this.service = service;
    }

    @PostMapping("/what-if")
    public WhatIf.Response whatIf(@Valid @RequestBody WhatIf.Request request) {
        return service.compare(request.base(), request.scenario());
    }
}