/**
 * CylinderLayout.ts
 *
 * "Cylinder" view = a DIAGONAL HELIX / COIL (Pahari-style "spring").
 *
 * Cards wrap around a cylinder (x/z follow a circle) while marching along the
 * cylinder's axis (y). That makes a coil — like the loops of a spring. The
 * gallery's outer group tilts this coil so its axis runs diagonally across the
 * screen, and scrolling TRANSLATES the coil along that axis, so cards spiral
 * past on the diagonal (a bounded conveyor, not an endless spin).
 *
 * Because cards sit on a real cylinder surface, the ones at the front (z+) are
 * nearer the camera (bigger) and the ones at the back (z-) are farther (smaller)
 * — that depth is what gives the 3D "spring" feel a flat line can't.
 */

import { Vector3 } from 'three';

/**
 * Generate the diagonal-helix (coil) positions.
 *
 * @param totalCards   - Number of cards to position
 * @param spacing      - Axial gap between consecutive cards (along the coil axis)
 * @param radius       - Coil radius — how far cards bow out from the axis (depth)
 * @param angularStep  - Radians each successive card rotates around the coil
 *                       (bigger = tighter coil / more wrap per card)
 * @returns Array of Vector3 positions, centered around the origin on the axis
 */
export function calculateCylinderPositions(
  totalCards: number,
  spacing: number = 4.5,
  radius: number = 5.5,
  angularStep: number = 0.7
): Vector3[] {
  const positions: Vector3[] = [];

  for (let i = 0; i < totalCards; i++) {
    // Angle around the coil for this card
    const angle = i * angularStep;

    // Wrap around the cylinder surface (x/z) → the coil's curve + depth
    const x = radius * Math.sin(angle);
    const z = radius * Math.cos(angle);

    // March along the axis, centered so the coil is balanced around the middle
    const y = (i - (totalCards - 1) / 2) * spacing;

    positions.push(new Vector3(x, y, z));
  }

  return positions;
}
