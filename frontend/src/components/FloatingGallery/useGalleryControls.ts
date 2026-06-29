/**
 * useGalleryControls.ts
 * 
 * Custom hook managing gallery scroll interaction with spring physics
 * Behaves exactly like pahari.vercel.app:
 * - Scroll/wheel → rotates the cylinder drum with momentum
 * - Drag → adds velocity, keeps spinning after release
 * - Under-damped spring: slight overshoot then smooth settle
 * - Friction decay creates natural feel
 * 
 * Physics Model:
 * --------------
 * 1. Target Rotation: Where we want to be (set by scroll/drag input)
 * 2. Current Rotation: Where we are now (lerps toward target)
 * 3. Velocity: Momentum that persists after input stops
 * 4. Spring: Under-damped for overshoot + settle feel
 * 
 * IMPORTANT: This hook is meant to be used INSIDE Canvas context
 * The useFrame hook from @react-three/fiber only works inside <Canvas>
 */

import { useRef, useCallback, useEffect, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface GalleryControlsOptions {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  wheelSensitivity?: number;
  dragSensitivity?: number;
  stiffness?: number;
  friction?: number;
  /**
   * 'rotate'    → spin the group on Y (sphere drum).
   * 'translate' → slide the group along Y (bounded conveyor).
   * 'helix'     → spin on Y AND rise on Y together, coupled by helixPitch, so
   *               cards travel along the spring's coil (circular + up/down at once).
   */
  mode?: 'rotate' | 'translate' | 'helix';
  /**
   * For translate mode: the max |offset| (world units) the group may move, so
   * the conveyor stops once the first / last card reaches center instead of
   * scrolling into empty space. Ignored in other modes.
   */
  translateBounds?: number;
  /**
   * For helix mode: vertical rise (world units) per radian of rotation. Set to
   * the coil's pitch (spacing / angularStep) so cards flow exactly along the
   * spring wire — rotating around while rising, like unscrewing a spring.
   */
  helixPitch?: number;
}

interface UseGalleryControlsReturn {
  groupRef: RefObject<Group>;
}

/**
 * Hook for managing gallery rotation with spring physics (Pahari-style)
 * MUST be called from a component inside <Canvas>
 */
export function useGalleryControls(
  options: GalleryControlsOptions = {}
): UseGalleryControlsReturn {
  const {
    autoRotate = false,
    autoRotateSpeed = 0.1,
    wheelSensitivity = 0.002,      // Scroll speed multiplier
    dragSensitivity = 0.005,       // Drag rotation speed
    stiffness = 0.08,              // Spring stiffness (lower = more overshoot)
    friction = 0.95,               // Velocity decay (0.95 = 5% loss per frame)
    mode = 'rotate',               // 'rotate' | 'translate' | 'helix'
    translateBounds = 0,           // max |offset| for translate mode (0 = unbounded)
    helixPitch = 0,                // Y rise per radian for helix mode
  } = options;

  const groupRef = useRef<Group>(null);
  
  // Physics state
  const rotation = useRef(0);        // Current rotation (where we are)
  const target = useRef(0);          // Target rotation (where we want to be)
  const velocity = useRef(0);        // Momentum (persists after input stops)
  
  // Drag state
  const isDragging = useRef(false);
  const lastPointerX = useRef(0);

  /**
   * WHEEL EVENT: Scroll up/down rotates the drum
   * Adds to target rotation AND velocity for momentum
   */
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    // Calculate the rotation change from scroll
    const delta = e.deltaY * wheelSensitivity;
    
    // Add scroll delta to target rotation
    target.current += delta;
    
    // CRITICAL: Also set velocity for momentum!
    // This creates the "keeps spinning after scroll stops" effect
    velocity.current += delta * 0.5; // 50% of scroll goes to velocity
  }, [wheelSensitivity]);

  /**
   * POINTER DOWN: Start drag interaction
   */
  const handlePointerDown = useCallback((e: PointerEvent) => {
    isDragging.current = true;
    lastPointerX.current = e.clientX;
    
    // Stop velocity when user grabs (immediate control)
    velocity.current = 0;
    
    // Capture pointer for smooth dragging
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  }, []);

  /**
   * POINTER MOVE: Drag to spin the drum
   * Movement adds to both target rotation and velocity
   */
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;

    // Calculate horizontal drag distance
    const deltaX = e.clientX - lastPointerX.current;

    // Add drag movement to target rotation
    target.current += deltaX * dragSensitivity;
    
    // Set velocity for momentum after release
    velocity.current = deltaX * dragSensitivity;

    // Update last position
    lastPointerX.current = e.clientX;
  }, [dragSensitivity]);

  /**
   * POINTER UP: Release drag (velocity continues spinning)
   */
  const handlePointerUp = useCallback((e: PointerEvent) => {
    isDragging.current = false;
    (e.target as Element)?.releasePointerCapture?.(e.pointerId);
    
    // Velocity persists, creating momentum/throw effect
  }, []);

  /**
   * PER-FRAME PHYSICS UPDATE
   * This runs every frame (60fps) and creates the smooth spring + inertia feel
   * CRITICAL: This only works because we're inside <Canvas> context
   */
  useFrame(() => {
    if (!groupRef.current) return;

    // AUTO-ROTATE: only meaningful for the spinning sphere. In conveyor mode an
    // auto-advance would silently drift cards off-screen, so skip it.
    if (mode === 'rotate' && autoRotate && !isDragging.current && Math.abs(velocity.current) < 0.001) {
      target.current += autoRotateSpeed * 0.01;
    }

    // MOMENTUM: Apply velocity to target (creates "coasting" after release)
    target.current += velocity.current;

    // FRICTION: Velocity decays exponentially (natural slow-down)
    velocity.current *= friction;

    // Stop tiny velocities to prevent endless micro-movements
    if (Math.abs(velocity.current) < 0.0001) {
      velocity.current = 0;
    }

    // CLAMP (translate mode only): stop the conveyor at the first / last card so
    // you can't scroll into empty space. We clamp the TARGET (not the applied
    // value) so the spring eases into the bound instead of hard-stopping. Kill
    // velocity at the edge so momentum doesn't keep fighting the clamp.
    if (mode === 'translate' && translateBounds > 0) {
      if (target.current > translateBounds) {
        target.current = translateBounds;
        velocity.current = 0;
      } else if (target.current < -translateBounds) {
        target.current = -translateBounds;
        velocity.current = 0;
      }
    }

    // SPRING: Smooth approach to target with slight overshoot (the Pahari feel)
    const diff = target.current - rotation.current;
    rotation.current += diff * stiffness;

    // APPLY the spring-smoothed value per mode. Always set BOTH channels so a
    // leftover value from a previous mode can't linger.
    if (mode === 'translate') {
      // Slide straight up/down.
      groupRef.current.position.y = rotation.current;
      groupRef.current.rotation.y = 0;
    } else if (mode === 'helix') {
      // Spin AND rise together, coupled by the coil pitch → cards flow along the
      // spring wire (circular + up/down at once). This keeps the spring shape
      // fixed in space while each card travels to the next spot along the coil.
      groupRef.current.rotation.y = rotation.current;
      groupRef.current.position.y = rotation.current * helixPitch;
    } else {
      // Pure spin (sphere).
      groupRef.current.rotation.y = rotation.current;
      groupRef.current.position.y = 0;
    }
  });

  /**
   * Reset the spring whenever the mode flips. The sphere accumulates a large
   * rotation scalar; if we reused it as a translation offset the cylinder would
   * jump far off-screen. Zeroing on mode change keeps the switch clean.
   */
  useEffect(() => {
    target.current = 0;
    rotation.current = 0;
    velocity.current = 0;
  }, [mode]);

  /**
   * Setup event listeners on mount
   */
  useEffect(() => {
    // Listen on `window`, NOT the canvas. The canvas only covers part of the
    // viewport and the heading/toggle overlays sit on top of it — binding to the
    // canvas meant scrolling did nothing whenever the cursor was over those
    // areas (the "can't scroll at the bottom" bug). Window catches it everywhere.
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handleWheel, handlePointerDown, handlePointerMove, handlePointerUp]);

  return {
    groupRef,
  };
}
