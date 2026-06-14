import budgetRanges from "@/data/budget-ranges.json";
import destinations from "@/data/destinations.json";
import indiaRoutes from "@/data/india-routes.json";
import sampleItineraries from "@/data/sample-itineraries.json";
import travelTips from "@/data/travel-tips.json";
import type {
  BudgetRange,
  Destination,
  IndiaRoute,
  SampleItinerary,
  TravelSearchResult,
  TravelTip,
} from "@/lib/travel-data/types";

const destinationRows = destinations as Destination[];
const routeRows = indiaRoutes as IndiaRoute[];
const budgetRows = budgetRanges as BudgetRange[];
const itineraryRows = sampleItineraries as SampleItinerary[];
const tipRows = travelTips as TravelTip[];

const budgetWords = new Set([
  "budget",
  "cheap",
  "low",
  "affordable",
  "under",
  "cost",
  "price",
  "rupees",
  "inr",
]);
const routeWords = new Set([
  "to",
  "route",
  "road",
  "drive",
  "tour",
  "trip",
  "from",
]);

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalize(value).split(" ").filter(Boolean);
}

function includesAny(text: string, tokens: string[]) {
  const normalizedText = normalize(text);
  return tokens.some((token) => normalizedText.includes(token));
}

function scoreDestination(destination: Destination, tokens: string[]) {
  const fields = [
    destination.name,
    destination.stateOrCountry,
    destination.budgetLevel,
    ...destination.interests,
    ...destination.topAttractions,
    ...destination.foodHighlights,
  ];

  return fields.reduce((score, field) => {
    const fieldScore = tokens.filter((token) =>
      normalize(field).includes(token),
    ).length;
    return score + fieldScore;
  }, 0);
}

function scoreRoute(route: IndiaRoute, tokens: string[]) {
  const fields = [
    route.origin,
    route.destination,
    route.routeNotes,
    ...route.suggestedStops,
    ...route.segments.flatMap((segment) => [
      segment.from,
      segment.to,
      segment.notes,
    ]),
  ];

  const baseScore = fields.reduce((score, field) => {
    const fieldScore = tokens.filter((token) =>
      normalize(field).includes(token),
    ).length;
    return score + fieldScore;
  }, 0);

  const hasRouteIntent = tokens.some((token) => routeWords.has(token));
  return hasRouteIntent ? baseScore + 1 : baseScore;
}

function formatDestinations(rows: Destination[]) {
  if (rows.length === 0) {
    return "No exact destination matches found.";
  }

  return rows
    .map(
      (destination) =>
        `Destination: ${destination.name}, ${destination.stateOrCountry}\nBest months: ${destination.bestMonths.join(", ")}\nIdeal days: ${destination.idealDays}\nBudget: ${destination.estimatedDailyCost}\nInterests: ${destination.interests.join(", ")}\nAttractions: ${destination.topAttractions.join(", ")}\nFood: ${destination.foodHighlights.join(", ")}\nSafety notes: ${destination.safetyNotes}\nSample plan: ${destination.sampleItinerary}\nSource: ${destination.sourceUrl}`,
    )
    .join("\n\n");
}

function formatRoutes(rows: IndiaRoute[]) {
  if (rows.length === 0) {
    return "No exact route matches found.";
  }

  return rows
    .map((route) => {
      const segments = route.segments
        .map(
          (segment) =>
            `${segment.from} to ${segment.to}: ${segment.approxDriveTime}. ${segment.notes}`,
        )
        .join("\n");
      const nights = route.recommendedNights
        .map((night) => `${night.place}: ${night.nights} night(s)`)
        .join(", ");

      return `Route: ${route.origin} to ${route.destination}\nSuggested stops: ${route.suggestedStops.join(", ")}\nSegments:\n${segments}\nRecommended nights: ${nights}\nRoute notes: ${route.routeNotes}\nSource: ${route.sourceUrl}`;
    })
    .join("\n\n");
}

function formatBudgets(rows: BudgetRange[]) {
  return rows
    .map(
      (budget) =>
        `${budget.level}: hotel ${budget.hotelPerNight}; food ${budget.foodPerDay}; local travel ${budget.localTravelPerDay}. ${budget.notes}`,
    )
    .join("\n");
}

function formatItineraries(rows: SampleItinerary[]) {
  if (rows.length === 0) {
    return "No close sample itinerary matches found.";
  }

  return rows
    .map(
      (itinerary) =>
        `${itinerary.title} (${itinerary.duration})\nPlaces: ${itinerary.places.join(", ")}\n${itinerary.plan.join("\n")}\nBudget hint: ${itinerary.budgetHint}`,
    )
    .join("\n\n");
}

function formatTips(rows: TravelTip[]) {
  return rows.map((tip) => `${tip.topic}: ${tip.tips.join(" ")}`).join("\n");
}

export function searchTravelData(query: string): TravelSearchResult {
  const tokens = tokenize(query);
  const wantsBudget = tokens.some((token) => budgetWords.has(token));

  const exactRoutes = routeRows.filter(
    (route) =>
      tokens.includes(normalize(route.origin)) &&
      tokens.includes(normalize(route.destination)),
  );
  const routes =
    exactRoutes.length > 0
      ? exactRoutes.slice(0, 2)
      : routeRows
          .map((route) => ({ route, score: scoreRoute(route, tokens) }))
          .filter(({ score }) => score > 0)
          .sort((left, right) => right.score - left.score)
          .slice(0, 2)
          .map(({ route }) => route);

  const routeStops = new Set(
    routes.flatMap((route) =>
      [route.origin, route.destination, ...route.suggestedStops].map(normalize),
    ),
  );

  const destinationsByScore = destinationRows
    .map((destination) => {
      const routeBonus = routeStops.has(normalize(destination.name)) ? 4 : 0;
      return {
        destination,
        score: scoreDestination(destination, tokens) + routeBonus,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map(({ destination }) => destination);

  const itineraries = itineraryRows
    .filter((itinerary) =>
      includesAny(
        [itinerary.title, ...itinerary.places, ...itinerary.plan].join(" "),
        tokens,
      ),
    )
    .slice(0, 2);

  const tips = tipRows
    .filter((tip) => includesAny([tip.topic, ...tip.tips].join(" "), tokens))
    .slice(0, 3);
  const selectedBudgets = wantsBudget
    ? budgetRows
    : budgetRows.filter((budget) => budget.level !== "premium");

  const context = [
    "Travel Context",
    "Routes:",
    formatRoutes(routes),
    "Destinations:",
    formatDestinations(destinationsByScore),
    "Budget ranges:",
    formatBudgets(selectedBudgets),
    "Sample itineraries:",
    formatItineraries(itineraries),
    "Travel tips:",
    formatTips(tips.length > 0 ? tips : tipRows.slice(0, 2)),
  ].join("\n\n");

  return {
    destinations: destinationsByScore,
    routes,
    budgets: selectedBudgets,
    itineraries,
    tips,
    context,
  };
}
