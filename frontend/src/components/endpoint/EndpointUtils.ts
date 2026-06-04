/**
 * Translates standard GPS coordinates (latitude, longitude) into coordinates
 * within our customized high-fidelity continental SVG map space.
 */
export const geoToXY = (lat: number, lng: number): { x: number; y: number } => {
  const x = ((lng + 180) / 360) * 1000;
  const latMin = -60;
  const latMax = 80;
  const clampedLat = Math.max(latMin, Math.min(latMax, lat));
  const y = 400 - ((clampedLat - latMin) / (latMax - latMin)) * 400;
  return { x, y };
};
