export interface PropertyFeatures {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

export interface EstimateResult {
  predictions: number[];
  count: number;
}

export type FormErrors = Partial<Record<keyof PropertyFeatures, string>>;

export interface HistoryEntry {
  id: string;
  form: PropertyFeatures;
  price: number;
  timestamp: string;
}