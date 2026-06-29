/**
 * SphereLayout.ts
 * 
 * Calculates 3D positions AND rotations for cards arranged in a sphere
 * Cards face OUTWARD from center with tilt based on position
 */

import { Vector3, Euler } from 'three';

export interface LayoutResult {
  position: Vector3;
  rotation: Euler;
}

/**
 * Generate sphere layout positions using Fibonacci sphere distribution
 * Cards positioned on sphere surface and TILTED to face outward
 * 
 * @param totalCards - Number of cards to position
 * @param radius - Sphere radius in 3D units
 * @returns Array of {position, rotation} objects
 */
export function calculateSpherePositions(
  totalCards: number,
  radius: number = 12
): LayoutResult[] {
  const results: LayoutResult[] = [];
  
  // Golden ratio constant for spiral distribution
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const angleIncrement = Math.PI * 2 * goldenRatio;

  for (let i = 0; i < totalCards; i++) {
    // Normalize index to [-1, 1] range for latitude
    const y = 1 - (i / (totalCards - 1 || 1)) * 2;
    
    // Calculate radius at this latitude
    const radiusAtY = Math.sqrt(1 - y * y);
    
    // Golden angle for longitude
    const theta = angleIncrement * i;
    
    // Convert spherical coordinates to Cartesian
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    
    // Scale by desired radius
    const position = new Vector3(
      x * radius,
      y * radius,
      z * radius
    );
    
    // Calculate rotation to face OUTWARD from center
    // Card looks at origin, then flips 180° to face away
    const rotation = new Euler();
    rotation.setFromVector3(position.clone().normalize());
    rotation.y += Math.PI; // Flip to face outward
    
    results.push({ position, rotation });
  }

  return results;
}
