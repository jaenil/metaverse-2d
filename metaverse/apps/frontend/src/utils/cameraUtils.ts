export function calculateCameraPosition(
  sw: number,
  sh: number,
  logicalWidth: number,
  logicalHeight: number,
  TILE: number,
  myRender: { x: number, y: number } | undefined,
  myPosRefCurrent: { x: number, y: number } | null
) {
  let targetCamX = sw / 2;
  let targetCamY = sh / 2;

  if (myRender) {
    targetCamX -= myRender.x * TILE + TILE / 2;
    targetCamY -= myRender.y * TILE + TILE / 2;
  } else if (myPosRefCurrent) {
    targetCamX -= myPosRefCurrent.x * TILE + TILE / 2;
    targetCamY -= myPosRefCurrent.y * TILE + TILE / 2;
  }

  const W = logicalWidth * TILE;
  const H = logicalHeight * TILE;

  let camX = targetCamX;
  let camY = targetCamY;

  // Clamp Camera to Map Boundaries
  if (W <= sw) {
    camX = (sw - W) / 2; // Center horizontally if map is smaller than screen
  } else {
    camX = Math.max(sw - W, Math.min(0, camX));
  }

  if (H <= sh) {
    camY = (sh - H) / 2; // Center vertically if map is smaller than screen
  } else {
    camY = Math.max(sh - H, Math.min(0, camY));
  }

  return { camX, camY };
}
