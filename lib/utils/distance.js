'use strict';

export function computeDistance(coordsA, coordsB) {
  const latitudeA = coordsA.latitude;
  const longitudeA = coordsA.longitude;
  const latitudeB = coordsB.latitude;
  const longitudeB = coordsB.longitude;

  const deg2rad = (deg) => deg * (Math.PI / 180);

  // Authalic radius of the Earth in metres.
  // @see https://en.wikipedia.org/wiki/Earth_radius#Authalic_radius
  const R = 6371007.2;
  const dLat = deg2rad(latitudeB - latitudeA);
  const dLon = deg2rad(longitudeB - longitudeA);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(latitudeA)) * Math.cos(deg2rad(latitudeB)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in metres.
  return R * c;
}
