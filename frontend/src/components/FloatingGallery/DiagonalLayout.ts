/**
 * DiagonalLayout.ts
 * 
 * Creates a diagonal spread layout like pahari.vercel.app
 * Cards are positioned from top-left to bottom-right with varying depths
 * 
 * Layout Characteristics:
 * ----------------------
 * - Cards spread diagonally across the screen
 * - Each card has a random offset for organic feel
 * - Different Z depths create layered effect
 * - Cards are sized differently for visual interest
 */

import { Vector3 } from 'three';

/**
 * Generate diagonal layout positions (Pahari-style)
 * Cards spread from top-left to bottom-right with varying depths
 * 
 * @param totalCards - Number of cards to position
 * @param spreadX - Horizontal spread distance (default 20)
 * @param spreadY - Vertical spread distance (default 15)
 * @returns Array of Vector3 positions
 */
export function calculateDiagonalPositions(
  totalCards: number,
  spreadX: number = 20,
  spreadY: number = 15
): Vector3[] {
  const positions: Vector3[] = [];
  
  // Calculate spacing between cards
  const stepX = spreadX / (totalCards - 1 || 1);
  const stepY = spreadY / (totalCards - 1 || 1);
  
  for (let i = 0; i < totalCards; i++) {
    // Base diagonal position (top-left to bottom-right)
    const baseX = -spreadX / 2 + i * stepX;
    const baseY = spreadY / 2 - i * stepY;
    
    // Add random offset for organic feel (like Pahari)
    const randomOffsetX = (Math.random() - 0.5) * 3;
    const randomOffsetY = (Math.random() - 0.5) * 3;
    
    // Z depth varies to create layers (closer and farther cards)
    const baseZ = (Math.random() - 0.5) * 8;
    
    positions.push(
      new Vector3(
        baseX + randomOffsetX,
        baseY + randomOffsetY,
        baseZ
      )
    );
  }
  
  return positions;
}

/**
 * Alternative: Grid-based scatter layout with CENTER AREA CLEARED
 * Cards positioned around the edges, leaving center for hero content
 */
export function calculateScatterPositions(
  totalCards: number,
  areaWidth: number = 30,
  areaHeight: number = 20
): Vector3[] {
  const positions: Vector3[] = [];
  
  // Define center exclusion zone (where hero text is)
  const centerExclusionWidth = 12;
  const centerExclusionHeight = 10;
  
  for (let i = 0; i < totalCards; i++) {
    let x, y, z;
    let attempts = 0;
    
    // Keep trying until we find a position outside the center zone
    do {
      // Random position across entire area
      x = (Math.random() - 0.5) * areaWidth;
      y = (Math.random() - 0.5) * areaHeight;
      z = (Math.random() - 0.5) * 12; // Varying depth
      
      attempts++;
      if (attempts > 50) break; // Safety break
      
    } while (
      // Check if position is in center exclusion zone
      Math.abs(x) < centerExclusionWidth / 2 && 
      Math.abs(y) < centerExclusionHeight / 2
    );
    
    positions.push(new Vector3(x, y, z));
  }
  
  return positions;
}
