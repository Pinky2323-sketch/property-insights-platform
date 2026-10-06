package com.realty.market.service;

import com.realty.market.model.PropertyFeatures;

import java.util.List;

public interface ModelPredictor {

    List<Double> predict(List<PropertyFeatures> properties);
}