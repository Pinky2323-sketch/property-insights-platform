package com.realty.market.repository;

import com.realty.market.model.Property;

import java.util.List;

public interface PropertyRepository {

    List<Property> findAll();
}