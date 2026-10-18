export type TravelInput = {
  maxSpeedPercent: number;
  accelerationYears: number;
  distanceLightYears: number;
};

export type TravelResult = {
  planetYears: number;
  shipYears: number;
  rampPlanetYears: number;
  rampShipYears: number;
  cruisePlanetYears: number;
  cruiseShipYears: number;
  peakSpeedPercent: number;
  reachesMaxSpeed: boolean;
};

export type TravelError = "speed" | "duration" | "distance" | "range";

export function calculateInterstellarTravel(
  input: TravelInput,
):
  | { result: TravelResult; error?: never }
  | { result?: never; error: TravelError } {
  const { maxSpeedPercent, accelerationYears, distanceLightYears } = input;
  if (
    !Number.isFinite(maxSpeedPercent) ||
    maxSpeedPercent <= 0 ||
    maxSpeedPercent >= 100
  ) {
    return { error: "speed" };
  }
  if (!Number.isFinite(accelerationYears) || accelerationYears <= 0) {
    return { error: "duration" };
  }
  if (!Number.isFinite(distanceLightYears) || distanceLightYears <= 0) {
    return { error: "distance" };
  }

  // Units: years, light-years, c = 1. Equal constant proper acceleration
  // magnitudes for departure and braking; planets share one inertial frame.
  const beta = maxSpeedPercent / 100;
  const inverseGamma = Math.sqrt((1 - beta) * (1 + beta));
  const acceleration = beta / (inverseGamma * accelerationYears);
  // Stable equivalent of (gamma - 1) / acceleration, even at low speed.
  const fullRampDistance = (accelerationYears * beta) / (1 + inverseGamma);
  const reachesMaxSpeed = distanceLightYears >= 2 * fullRampDistance;
  const halfDistance = distanceLightYears / 2;
  const rampPlanetYears = reachesMaxSpeed
    ? accelerationYears
    : Math.sqrt(halfDistance) * Math.sqrt(halfDistance + 2 / acceleration);
  const scaledRampTime = acceleration * rampPlanetYears;
  const peakGamma = Math.hypot(1, scaledRampTime);
  const peakBeta = reachesMaxSpeed ? beta : scaledRampTime / peakGamma;
  const rampShipYears = Math.asinh(scaledRampTime) / acceleration;
  const cruisePlanetYears = reachesMaxSpeed
    ? Math.max(0, distanceLightYears - 2 * fullRampDistance) / beta
    : 0;
  const cruiseShipYears = cruisePlanetYears / peakGamma;
  const result: TravelResult = {
    planetYears: 2 * rampPlanetYears + cruisePlanetYears,
    shipYears: 2 * rampShipYears + cruiseShipYears,
    rampPlanetYears,
    rampShipYears,
    cruisePlanetYears,
    cruiseShipYears,
    peakSpeedPercent: peakBeta * 100,
    reachesMaxSpeed,
  };

  if (
    !Number.isFinite(acceleration) ||
    acceleration <= 0 ||
    !Number.isFinite(peakGamma) ||
    Object.values(result).some(
      (value) => typeof value === "number" && !Number.isFinite(value),
    ) ||
    result.planetYears <= 0 ||
    result.shipYears <= 0 ||
    peakBeta <= 0 ||
    peakBeta >= 1
  ) {
    return { error: "range" };
  }
  return { result };
}
