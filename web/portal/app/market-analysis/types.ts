export interface MarketSummary {
  count: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgSquareFootage: number;
  avgPricePerSqft: number;
}

export interface GroupStat {
  label: string;
  count: number;
  avgPrice: number;
}

export interface MarketProperty {
  id: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  distanceToCityCenter: number;
  schoolRating: number;
  price: number;
}