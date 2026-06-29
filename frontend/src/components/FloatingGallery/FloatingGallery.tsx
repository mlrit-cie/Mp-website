/**
 * FloatingGallery.tsx
 * 
 * Main orchestrator component that:
 * - Manages layout state (sphere vs cylinder)
 * - Renders Canvas with camera FOV 50° (like Pahari)
 * - Provides toggle UI
 * - Handles layout transitions with smooth position interpolation
 * - CRITICAL: Only the parent group rotates for scroll/drag - individual cards never rotate
 * 
 * Camera Positioning:
 * ------------------
 * - Position: [0, 0, 20] - 20 units back on Z-axis
 * - FOV: 50° - balanced perspective for subtle edge depth (like Pahari)
 * - LookAt: [0, 0, 0] - center of the gallery
 * 
 * Data Flow:
 * ---------
 * 1. Parent passes cards[] to FloatingGallery
 * 2. FloatingGallery calculates positions based on active layout
 * 3. Positions lerp smoothly when layout changes
 * 4. Each GalleryCard receives its card data + target position
 * 5. GalleryCard's inner group copies camera.quaternion for clean billboarding
 */

'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Vector3 } from 'three';
import { motion } from 'framer-motion';
import { GalleryCard, CardPlaceholder } from './GalleryCard';
import { calculateSpherePositions } from './SphereLayout';
import { calculateCylinderPositions } from './CylinderLayout';
import { calculateScatterPositions } from './DiagonalLayout';
import { useGalleryControls } from './useGalleryControls';
import { FloatingGalleryProps, LayoutType } from './gallery.types';

/**
 * Inner scene component that handles the 3D rendering
 * CRITICAL: Only this parent group rotates - individual cards never rotate on scroll/drag
 */
const GalleryScene: React.FC<{
  cards: FloatingGalleryProps['cards'];
  layout: LayoutType;
  radius: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
}> = ({ cards, layout, radius, autoRotate, autoRotateSpeed }) => {

  // Cylinder = HELIX scroll: cards spin around the drum AND rise/fall together,
  // following the spring's coil (circular + up/down at once). Sphere = pure spin.
  // helixPitch = coil pitch (rise per radian) so cards flow exactly along the wire.
  const isCylinder = layout === 'cylinder';
  const { groupRef } = useGalleryControls({
    autoRotate,
    autoRotateSpeed,
    wheelSensitivity: 0.0025,   // scroll → rotation speed
    dragSensitivity: 0.005,     // drag → rotation speed
    stiffness: 0.08,            // Spring stiffness (lower = more overshoot)
    friction: 0.95,             // Velocity decay (0.95 = 5% loss per frame)
    mode: isCylinder ? 'helix' : 'rotate',
    helixPitch: CYL_SPACING / CYL_ANGULAR_STEP,
  });

  /**
   * Calculate target positions based on current layout.
   * Memoized to avoid recalculation on every render.
   *
   * ROOT-CAUSE FIX (cards disappearing):
   * ------------------------------------
   * The cylinder/sphere layouts return `LayoutResult` objects ({ position, rotation })
   * while the scatter layout returns raw `Vector3[]`. The render path below feeds each
   * entry straight into <group position={...}>, which expects a Vector3. Passing the
   * whole { position, rotation } object made R3F read it as coordinates → NaN → every
   * card collapsed to an invalid position and vanished.
   *
   * We normalize here so this memo ALWAYS yields a clean Vector3[]:
   * - discriminate the two shapes (Vector3 vs LayoutResult)
   * - skip/replace any entry that produced NaN so the math can never blank the scene
   *
   * NOTE: the layout's per-card rotation is intentionally dropped. These cards use
   * drei <Billboard>, which overwrites child orientation every frame to face the
   * camera — so cylinder/sphere rotation is dead for this implementation. Position
   * is the only thing that matters.
   */
  const targetPositions = useMemo<Vector3[]>(() => {
    // 1. Run the active layout (mixed return shapes)
    const raw =
      layout === 'sphere'
        ? // Sphere is unchanged (you said it's good) — uses the full radius prop
          calculateSpherePositions(cards.length, radius)
        : layout === 'cylinder'
        ? // Cylinder = a diagonal helix/coil (the outer tilt makes the axis
          //   diagonal, scroll translates along it). Cards wrap around CYL_RADIUS
          //   for depth and step CYL_SPACING along the axis.
          calculateCylinderPositions(cards.length, CYL_SPACING, CYL_RADIUS, CYL_ANGULAR_STEP)
        : calculateScatterPositions(cards.length, 30, 20);

    // 2. Normalize every entry to a plain Vector3, guarding against NaN
    const normalized = raw.map((entry) => {
      // LayoutResult ({ position, rotation }) → take .position; Vector3 → use as-is
      const v = entry instanceof Vector3 ? entry : entry.position;

      // NaN guard: if any axis is invalid, fall back to origin so a single bad
      // card can never push a NaN into the group and hide everything.
      if (!v || Number.isNaN(v.x) || Number.isNaN(v.y) || Number.isNaN(v.z)) {
        return new Vector3(0, 0, 0);
      }
      return v;
    });

    // 3. Dev-only sanity log so we can confirm valid numbers in the console
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        `[FloatingGallery] layout="${layout}" positions:`,
        normalized.map((v) => [v.x.toFixed(2), v.y.toFixed(2), v.z.toFixed(2)])
      );
    }

    return normalized;
  }, [layout, cards.length, radius]);

  /**
   * Render all cards at their target positions
   * Each card's position is set once by the layout
   * Each card's rotation is handled internally via camera.quaternion copying
   */
  return (
    <>
      {/* Camera setup - FOV 50° like Pahari for subtle edge perspective.
          Explicit near/far so cards (radius up to ~12, camera at z=20) are always
          comfortably inside the frustum and can never be clipped away. */}
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} near={0.1} far={1000} />

      {/* Lighting - soft ambient + directional keys */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {/* NOTE: <Environment preset="city" /> was removed. It fetches an HDR from a
          CDN and SUSPENDS the whole scene while loading; if that request is blocked
          (CSP / offline), the only Suspense boundary swaps the entire gallery for
          null → canvas renders but zero cards. The cards are DOM (Html/Billboard),
          so the environment map gave them no visual benefit anyway. */}

      {/*
        DIAGONAL DRUM (Pahari-style)
        ----------------------------
        OUTER group: a STATIC diagonal tilt. Rolling the drum on Z (and a touch of
        X) turns the upright cylinder into a diagonal one, so cards sit on a line
        that runs bottom-left → top-right.
        INNER group (groupRef): the spinning drum driven by the scroll/drag spring.
        Because it's a child of the tilted group, its spin axis is tilted too — so
        cards flow ALONG the diagonal as you scroll, instead of straight sideways.

        Tilt kept small on purpose: with radius 12 and the camera at z=20 the drum
        already reaches near the frustum edges, so a large roll would swing top
        cards off-screen. Nudge TILT_Z up only after confirming nothing clips.
      */}
      <group rotation={[TILT_X, 0, TILT_Z]}>
        {/* SPINNING DRUM: only this rotates for scroll/drag interaction */}
        <group ref={groupRef}>
          {cards.map((card, index) => (
            <Suspense key={card.id} fallback={<CardPlaceholder position={targetPositions[index]} />}>
              <GalleryCard
                card={card}
                position={targetPositions[index]}
                index={index}
                totalCards={cards.length}
                emphasizeFront={isCylinder}
              />
            </Suspense>
          ))}
        </group>
      </group>
    </>
  );
};

/**
 * Diagonal tilt of the whole conveyor (radians). This is what turns the vertical
 * card column into Pahari's diagonal line — and because the cards translate along
 * the column's (now-tilted) axis, the scroll travels along that same diagonal.
 * - TILT_Z is the MAIN knob: it rolls the column off vertical. NEGATIVE so the
 *   line runs bottom-left → top-right ("/"), like Pahari. ~-0.95 rad ≈ a line
 *   about 35° above horizontal (a strong diagonal, not a near-vertical lean).
 * - TILT_X adds a slight forward lean so one end sits nearer the camera (depth).
 * Flip TILT_Z's sign to mirror the diagonal; reduce its magnitude for a steeper
 * (more vertical) line, increase it for a flatter (more horizontal) one.
 */
// STRAIGHT vertical spring: no tilt. The coil stands upright like a real spring.
const TILT_X = 0;
const TILT_Z = 0;

/**
 * Cylinder helix (coil) shape — the "spring". The axial march runs along the
 * (tilted) diagonal; the coil's sideways swing rides perpendicular to it, drawing
 * the S-curve. Keep SPACING comfortably larger than RADIUS so the diagonal wins
 * and the S reads as a gentle wave along the diagonal (not a vertical zig-zag).
 * - CYL_SPACING:      axial gap between cards along the coil (also sets scroll bounds)
 * - CYL_RADIUS:       how far cards swing side-to-side → S-curve amplitude + depth
 * - CYL_ANGULAR_STEP: radians each card rotates around the coil (bigger = tighter S)
 */
// Vertical rise per card — smaller = cards closer together along the spring.
const CYL_SPACING = 3;
// Wider cylinder so the coil bows out more (cards spread wider left/right).
const CYL_RADIUS = 9;
// ~1.05 rad/card → ~6 cards per full loop. With 20 cards that's ~3 coils, so the
// drum reads as a real spring as it rotates (not a single round ring).
const CYL_ANGULAR_STEP = 1.05;

/**
 * Main FloatingGallery component
 */
export const FloatingGallery: React.FC<FloatingGalleryProps> = ({
  cards,
  radius = 8,
  defaultLayout = 'cylinder',  // Back to cylinder (neat spiral)
  autoRotate = true,           // Enable auto-rotate
  autoRotateSpeed = 0.1,
  title,                       // Optional big heading (Pahari-style)
  subtitle,                    // Optional subtitle under the heading
}) => {
  const [layout, setLayout] = useState<LayoutType>(defaultLayout);
  const [reducedMotion, setReducedMotion] = useState(false);

  /**
   * Check for prefers-reduced-motion accessibility setting
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * The two views exposed in the UI, exactly like Pahari: sphere / cylinder.
   * (The 'scatter' layout still exists in code but is intentionally not shown.)
   */
  const VIEWS: { key: LayoutType; label: string }[] = [
    { key: 'sphere', label: 'sphere' },
    { key: 'cylinder', label: 'cylinder' },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        background: 'transparent',
      }}
    >
      {/* 3D Canvas with optimized performance settings.
          zIndex 2 puts the cards ABOVE the centered heading (zIndex 1), so cards
          float in front of the title (the title shows through the transparent
          canvas where there are no cards) — instead of the text covering cards. */}
      <Canvas
        dpr={[1, 2]} // Cap device pixel ratio for performance
        performance={{ min: 0.5 }} // Auto-adjust quality if FPS drops
        style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <GalleryScene
            cards={cards}
            layout={layout}
            radius={radius}
            autoRotate={reducedMotion ? false : autoRotate}
            autoRotateSpeed={autoRotateSpeed}
          />
        </Suspense>
      </Canvas>

      {/*
        CENTERED HEADING (Pahari-style)
        -------------------------------
        Title + subtitle sit dead-center of the screen, like "Pahāri / The
        Floating Gallery". pointer-events:none so it never blocks scroll/drag of
        the gallery behind it.
      */}
      {(title || subtitle) && (
        // Static flex wrapper does the centering (NOT a CSS transform).
        // Framer Motion manages `transform` on the inner element, so centering
        // must NOT rely on translate(-50%) — that was why the heading drifted
        // right. Flexbox centering is immune to Motion's transform writes.
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5, // ABOVE the canvas (zIndex 2) → the title overlaps the cards
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none', // never intercept scroll/drag
          }}
        >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            maxWidth: '90vw',
          }}
        >
          {title && (
            <h1
              style={{
                margin: 0,
                fontFamily: "'Inter', sans-serif", // neutral bold sans, like the reference
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: '#0f172a', // dark text for the light theme
              }}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p
              style={{
                margin: 0,
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#64748b', // muted slate, like the reference
              }}
            >
              {subtitle}
            </p>
          )}
        </motion.div>
        </div>
      )}

      {/*
        "CHANGE THE VIEW :" TOGGLE (bottom-center)
        ------------------------------------------
        Separate from the heading, anchored at the bottom like Pahari. A static
        flex wrapper centers it (same reason as the heading: Motion owns the
        transform, so we can't center via translateX).
      */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          pointerEvents: 'auto',
          fontFamily: "'Inter', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(255, 255, 255, 0.7)', // light glass for the light theme
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '9999px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            color: 'rgba(15, 23, 42, 0.6)', // dark muted label
            paddingLeft: '0.5rem',
            whiteSpace: 'nowrap',
          }}
        >
          Change the View :
        </span>

        {/* One pill button per view; the active view is highlighted */}
        {VIEWS.map((view) => {
          const isActive = layout === view.key;
          return (
            <button
              key={view.key}
              onClick={() => setLayout(view.key)}
              aria-pressed={isActive}
              aria-label={`Show ${view.label} view`}
              style={{
                fontFamily: "'Inter', sans-serif",
                padding: '0.4rem 1.1rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '9999px',
                cursor: 'pointer',
                border: '1px solid',
                transition: 'all 0.25s ease',
                // Active = emerald fill; inactive = light glass with dark text
                background: isActive ? '#10b981' : 'rgba(0, 0, 0, 0.04)',
                color: isActive ? '#ffffff' : 'rgba(15, 23, 42, 0.8)',
                borderColor: isActive ? '#10b981' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              {view.label}
            </button>
          );
        })}
      </motion.div>
      </div>

      {/* Accessible fallback - hidden visually, available to screen readers */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        aria-live="polite"
      >
        <h2>Gallery Cards</h2>
        <ul>
          {cards.map((card) => (
            <li key={card.id}>
              <a 
                href={card.link || '#'} 
                onClick={(e) => {
                  if (card.onClick) {
                    e.preventDefault();
                    card.onClick(card);
                  }
                }}
              >
                {card.title}
                {card.subtitle && ` - ${card.subtitle}`}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FloatingGallery;
