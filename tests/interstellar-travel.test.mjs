import assert from "node:assert/strict";
import test from "node:test";
import { calculateInterstellarTravel } from "../src/utils/interstellarTravel.ts";

function calculate(overrides = {}) {
  const { result, error } = calculateInterstellarTravel({
    maxSpeedPercent: 80,
    accelerationYears: 1,
    distanceLightYears: 4.24,
    ...overrides,
  });
  assert.equal(error, undefined);
  return result;
}

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)),
    `${actual} != ${expected}`,
  );
}

test("accelerate, cruise, and brake at 80% c", () => {
  const trip = calculate();
  // gamma = 5/3, proper acceleration = 4/3 c/year;
  // each ramp spans 0.5 ly, leaving 3.24 ly of cruise.
  close(trip.planetYears, 6.05);
  close(trip.rampShipYears, 0.75 * Math.log(3));
  close(trip.cruiseShipYears, 2.43);
  close(trip.shipYears, 1.5 * Math.log(3) + 2.43);
  close(trip.peakSpeedPercent, 80);
  assert.equal(trip.reachesMaxSpeed, true);
});

test("short route keeps acceleration but lowers the peak and removes cruise", () => {
  const trip = calculate({ distanceLightYears: 0.5 });
  close(trip.rampPlanetYears, Math.sqrt(7) / 4);
  close(trip.peakSpeedPercent, (Math.sqrt(7) / 4) * 100);
  close(trip.shipYears, 1.5 * Math.acosh(4 / 3));
  assert.equal(trip.cruisePlanetYears, 0);
  assert.equal(trip.cruiseShipYears, 0);
  assert.equal(trip.reachesMaxSpeed, false);
  assert.ok(trip.rampPlanetYears < 1);
});

test("transition from triangular to cruising profile is continuous", () => {
  const below = calculate({ distanceLightYears: 1 - 1e-9 });
  const boundary = calculate({ distanceLightYears: 1 });
  const above = calculate({ distanceLightYears: 1 + 1e-9 });
  close(boundary.planetYears, 2);
  close(boundary.shipYears, 1.5 * Math.log(3));
  close(below.planetYears, above.planetYears, 1e-8);
  close(below.shipYears, above.shipYears, 1e-8);
});

test("low-speed limit approaches the classical travel time", () => {
  const trip = calculate({
    maxSpeedPercent: 0.0001,
    distanceLightYears: 0.000004,
  });
  close(trip.planetYears, 5);
  close(trip.shipYears, trip.planetYears);
});

test("near-light-speed trips remain finite and slower than light", () => {
  const trip = calculate({
    maxSpeedPercent: 99.999999,
    distanceLightYears: 100,
  });
  assert.ok(trip.planetYears > 100);
  assert.ok(trip.shipYears > 0 && trip.shipYears < trip.planetYears);
});

test("ship time matches numerical integration of the full velocity profile", () => {
  for (const distanceLightYears of [0.5, 4.24]) {
    const trip = calculate({ distanceLightYears });
    const acceleration = 4 / 3;
    const steps = 10000;
    const dt = trip.rampPlanetYears / steps;
    let rampProperTime = 0;
    let rampDistance = 0;
    for (let i = 0; i < steps; i++) {
      const scaledTime = acceleration * (i + 0.5) * dt;
      const gamma = Math.hypot(1, scaledTime);
      rampProperTime += dt / gamma;
      rampDistance += (scaledTime / gamma) * dt;
    }
    const beta = trip.peakSpeedPercent / 100;
    const inverseGamma = Math.sqrt(1 - beta * beta);
    close(
      2 * rampDistance + beta * trip.cruisePlanetYears,
      distanceLightYears,
      1e-8,
    );
    close(
      2 * rampProperTime + inverseGamma * trip.cruisePlanetYears,
      trip.shipYears,
      1e-8,
    );
  }
});

test("invalid inputs never produce displayed results", () => {
  for (const maxSpeedPercent of [0, -1, 100, 101, NaN, Infinity]) {
    assert.equal(
      calculateInterstellarTravel({
        maxSpeedPercent,
        accelerationYears: 1,
        distanceLightYears: 4,
      }).error,
      "speed",
    );
  }
  for (const value of [0, -1, NaN, Infinity]) {
    assert.equal(
      calculateInterstellarTravel({
        maxSpeedPercent: 80,
        accelerationYears: value,
        distanceLightYears: 4,
      }).error,
      "duration",
    );
    assert.equal(
      calculateInterstellarTravel({
        maxSpeedPercent: 80,
        accelerationYears: 1,
        distanceLightYears: value,
      }).error,
      "distance",
    );
  }
  assert.equal(
    calculateInterstellarTravel({
      maxSpeedPercent: 80,
      accelerationYears: Number.MIN_VALUE,
      distanceLightYears: 4,
    }).error,
    "range",
  );
});
