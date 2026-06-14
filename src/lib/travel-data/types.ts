export type Destination = {
  name: string;
  stateOrCountry: string;
  bestMonths: string[];
  idealDays: number;
  interests: string[];
  budgetLevel: string;
  estimatedDailyCost: string;
  topAttractions: string[];
  foodHighlights: string[];
  safetyNotes: string;
  sampleItinerary: string;
  sourceUrl: string;
};

export type RouteSegment = {
  from: string;
  to: string;
  approxDriveTime: string;
  notes: string;
};

export type IndiaRoute = {
  origin: string;
  destination: string;
  suggestedStops: string[];
  segments: RouteSegment[];
  recommendedNights: Array<{
    place: string;
    nights: number;
  }>;
  routeNotes: string;
  sourceUrl: string;
};

export type BudgetRange = {
  level: string;
  hotelPerNight: string;
  foodPerDay: string;
  localTravelPerDay: string;
  notes: string;
};

export type SampleItinerary = {
  title: string;
  duration: string;
  places: string[];
  plan: string[];
  budgetHint: string;
};

export type TravelTip = {
  topic: string;
  tips: string[];
};

export type TravelSearchResult = {
  destinations: Destination[];
  routes: IndiaRoute[];
  budgets: BudgetRange[];
  itineraries: SampleItinerary[];
  tips: TravelTip[];
  context: string;
};
