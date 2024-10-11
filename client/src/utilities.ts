import { Point } from "data/data";
import { scaleDiverging } from "d3-scale";
import { interpolateRdYlGn } from "d3-scale-chromatic";
import { rgb } from "d3";

export const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const gaussian = (x: number) => {
  return Math.exp(-0.5 * Math.abs(x) ** 2);
};

export const calculateSphericalDistance = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number => {
  const earthRadiusKm = 6371; // radius of the earth in kilometers
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const c =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const d = 2 * Math.asin(Math.sqrt(c));
  return earthRadiusKm * d;
};

// converts hex or RGB to RGBA
export const convertColorToRGBA = (color: string, alpha = 0.5) => {
  if (color.startsWith("#")) {
    const RGB = rgb(color);
    return `rgba(${RGB.r}, ${RGB.g}, ${RGB.b}, ${alpha})`;
  } else if (color.startsWith("rgb")) {
    return color.replace("rgb", "rgba").replace(")", `, ${alpha})`);
  }
  return color;
};

// coloring calculated as percent difference
export const getResidualColoring = (allPoints: Point[]) => {
  let min = Infinity;
  let max = -Infinity;
  let points = allPoints.map((p) => {
    let residual = 0;
    if (p.actual !== 0) residual = (p.actual - p.predicted) / p.actual;
    min = Math.min(min, residual);
    max = Math.max(max, residual);
    return {
      ...p,
      residual: residual,
    };
  });

  return points.map((p) => {
    let percentOfMax = 0;
    if (p.residual > 0) percentOfMax = p.residual / max;
    else percentOfMax = p.residual / min;

    const lightness = 150 + (255 - 150) * percentOfMax;
    const darkness = 150 - (255 - 150) * percentOfMax;

    let color = "";
    if (p.residual > 0)
      color = `rgba(${darkness},${lightness},${darkness},0.5)`;
    else color = `rgba(${lightness},${darkness},${darkness},0.5)`;

    return {
      ...p,
      color: color,
    };
  });
};

export const getBandwidthColoring = (
  center: Point,
  allPoints: Point[],
  bandwidth: number
) => {
  // adds distance to each point
  const points = allPoints.map((p) => ({
    ...p,
    distance: calculateSphericalDistance(center, p),
  }));

  // set color of k-nearest with gaussian weight
  return points
    .sort((a, b) => a.distance - b.distance)
    .map((p, i) => {
      if (i > bandwidth) return p;
      const lightness = 150 + (255 - 150) * gaussian(p.distance);
      const darkness = 150 - (255 - 150) * gaussian(p.distance);
      return {
        ...p,
        color: `rgba(${lightness},${darkness},${darkness},0.5)`,
      };
    });
};

export const getCoefficientColoring = (
  allPoints: Point[],
  coefficientMins: number[],
  coefficientMeds: number[],
  coefficientMaxes: number[],
  i: number, // the index in the coefficient arrays corresponding to the current feature (see implementation in `Map.tsx`)
  feature: string
) => {
  return allPoints.map((p) => {
    let color = "";

    let percentOfMax = 0;
    if (p.coefficients[feature] > coefficientMeds[i]) {
      const maxDiff = coefficientMaxes[i] - coefficientMeds[i];
      percentOfMax = (p.coefficients[feature] - coefficientMeds[i]) / maxDiff;
    } else {
      const maxDiff = coefficientMeds[i] - coefficientMins[i];
      percentOfMax =
        Math.abs(p.coefficients[feature] - coefficientMeds[i]) / maxDiff;
    }

    const lightness = 150 + (255 - 150) * Math.max(percentOfMax, 0);
    const darkness = 150 - (255 - 150) * Math.max(percentOfMax, 0);

    // intensity of magenta indicates the percent of the max positive deviation from the median (across all points) for a coefficient that is greater than the median coefficient (across all points)
    // intensity of cyan indicates the percent of the min negative deviation from the median (across all points) for a coefficient that is less than the median coefficient (across all points)
    if (p.coefficients[feature] > coefficientMeds[i]) {
      color = `rgba(${lightness},${darkness},${lightness},0.5)`;
    } else color = `rgba(${darkness},${lightness},${lightness},0.5)`;
    return {
      ...p,
      color,
    };
  });
};
