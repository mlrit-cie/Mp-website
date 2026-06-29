/**
 * GalleryCard.tsx
 * 
 * Individual card component with clean billboarding using drei's Billboard
 * CRITICAL: Uses nested groups to separate position from rotation
 * - Outer group: Position only (from layout, never rotated)
 * - Inner Billboard: Rotation handled by drei's Billboard (no manual quaternion copy needed)
 * 
 * This prevents mirrored text that happens with manual quaternion.copy on Html elements
 */

import React, { useRef, useState } from 'react';
import { Html, Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, MathUtils } from 'three';
import { GalleryCardData } from './gallery.types';

// Reused each frame to read a card's world position without allocating.
const _worldPos = new Vector3();
// How far (world Z) the drum reaches front-to-back; used to normalize "frontness".
const FRONT_RANGE = 10;

interface GalleryCardProps {
  card: GalleryCardData;
  position: Vector3;
  index: number;
  totalCards: number;
  /** When true (cylinder view only), the front-facing card grows + glows. */
  emphasizeFront?: boolean;
}

/**
 * Main GalleryCard component
 * Uses drei's Billboard component which handles Html content correctly (no mirroring)
 */
export const GalleryCard: React.FC<GalleryCardProps> = ({ card, position, emphasizeFront = false }) => {
  // Outer group ref (position only, never rotated)
  const outerGroupRef = useRef<Group>(null);
  // Ref to the card's DOM box so we can drive the glow per-frame without re-rendering
  const cardDivRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(1);

  /**
   * Animation loop (runs every frame):
   * - Cards nearest the CAMERA (front of the drum) scale UP and GLOW like a bulb;
   *   cards rotating to the back shrink and dim.
   * - Hover adds a little extra pop on top.
   * Billboard handles rotation automatically.
   */
  useFrame((state) => {
    if (!outerGroupRef.current) return;

    // SPHERE / other layouts: plain hover scale, no depth emphasis or bulb glow.
    if (!emphasizeFront) {
      const targetScale = hovered ? 1.15 : 1.0;
      scaleRef.current += (targetScale - scaleRef.current) * 0.1;
      outerGroupRef.current.scale.setScalar(scaleRef.current);
      if (cardDivRef.current) {
        cardDivRef.current.style.boxShadow = hovered
          ? '0 25px 60px rgba(16,185,129,0.4), 0 10px 30px rgba(0,0,0,0.6)'
          : '0 10px 30px rgba(0,0,0,0.4)';
        cardDivRef.current.style.borderColor = hovered
          ? 'rgba(16,185,129,0.3)'
          : 'rgba(255,255,255,0.1)';
        cardDivRef.current.style.filter = 'none';
      }
      return;
    }

    // CYLINDER: front-facing card grows + glows like a bulb.
    // World position of this card (reflects the spinning cylinder)
    outerGroupRef.current.getWorldPosition(_worldPos);

    // "Frontness": 1 when nearest the camera, 0 at the back. The camera looks
    // down -Z, so a higher world Z means the card is closer to the front.
    const frontness = MathUtils.clamp(
      (_worldPos.z + FRONT_RANGE) / (2 * FRONT_RANGE),
      0,
      1
    );

    // EMPHASIS: ramps up as a card approaches the camera. pow(...,3) keeps
    // back cards at base size (no increase) while clearly growing the card as it
    // swings to the front — smooth enough that the growth is visible, not a flash.
    const emphasis = Math.pow(frontness, 3);

    // SCALE: base 1.0 for everything; the front card grows up to ~2.1× (big,
    // obvious "comes forward" effect).
    const depthScale = 1.0 + emphasis * 1.1;
    const targetScale = depthScale * (hovered ? 1.12 : 1);
    scaleRef.current += (targetScale - scaleRef.current) * 0.12;
    outerGroupRef.current.scale.setScalar(scaleRef.current);

    // GLOW: only the front card lights up like a bulb; others stay plain.
    if (cardDivRef.current) {
      const g = emphasis;
      cardDivRef.current.style.boxShadow =
        `0 0 ${10 + g * 80}px rgba(16, 185, 129, ${0.05 + g * 0.7}), 0 10px 30px rgba(0,0,0,0.55)`;
      cardDivRef.current.style.borderColor = `rgba(16, 185, 129, ${0.1 + g * 0.7})`;
      cardDivRef.current.style.filter = `brightness(${0.9 + g * 0.6})`;
    }
  });

  /**
   * Handle card click - navigate to link or fire custom onClick
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.onClick) {
      card.onClick(card);
    } else if (card.link) {
      window.location.href = card.link;
    }
  };

  /**
   * Handle keyboard navigation for accessibility
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (card.onClick) {
        card.onClick(card);
      } else if (card.link) {
        window.location.href = card.link;
      }
    }
  };

  return (
    // OUTER GROUP: Position only (set by layout, never rotated)
    <group ref={outerGroupRef} position={position}>
      
      {/* 
        BILLBOARD: Handles rotation automatically
        - follow={true}: Always faces camera
        - lockX/Y/Z={false}: Free rotation on all axes
        - This prevents the text mirroring issue that happens with manual quaternion.copy
      */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        {/* HTML content rendered in 3D space - Billboard ensures it's never mirrored */}
        <Html
          transform
          occlude
          distanceFactor={4}
          style={{
            width: '280px',
            height: '380px',
            userSelect: 'none',
            pointerEvents: 'auto',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            ref={cardDivRef}
            role="button"
            tabIndex={0}
            aria-label={`${card.title}${card.subtitle ? ` - ${card.subtitle}` : ''}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '20px',
              overflow: 'hidden',
              cursor: 'pointer',
              // boxShadow / borderColor / filter are driven per-frame in useFrame
              // (the bulb glow), so we only set safe defaults here.
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              background: 'rgba(10, 10, 12, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(16, 185, 129, 0.1)',
            }}
          >
            {/* Background Image */}
            {card.imageUrl && (
              <img
                src={card.imageUrl}
                alt={card.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  opacity: hovered ? 0.75 : 0.5,
                  transition: 'opacity 0.3s ease',
                }}
                loading="lazy"
                crossOrigin="anonymous"
              />
            )}

            {/* Gradient Overlay for text readability */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Content Overlay - title and subtitle */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px',
                color: 'white',
                zIndex: 1,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  lineHeight: '1.3',
                  color: '#ffffff',
                }}
              >
                {card.title}
              </h3>
              {card.subtitle && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    opacity: 0.7,
                    lineHeight: '1.4',
                    color: '#10b981',
                    fontWeight: 500,
                  }}
                >
                  {card.subtitle}
                </p>
              )}
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
};

/**
 * Placeholder component shown while card content loads
 */
export const CardPlaceholder: React.FC<{ position: Vector3 }> = ({ position }) => {
  return (
    // Same nested structure: outer = position, Billboard handles rotation
    <group position={position}>
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Html
          transform
          distanceFactor={4}
          style={{
            width: '280px',
            height: '380px',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            Loading...
          </div>
        </Html>
      </Billboard>
    </group>
  );
};
