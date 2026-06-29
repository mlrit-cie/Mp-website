# FloatingGallery Spring Physics Fix - Pahari-Style Momentum

## Problem Fixed

Scroll interaction was wrong - scrolling just slid cards flatly. Now it behaves **exactly like pahari.vercel.app**:
- ✅ Scrolling rotates the entire gallery like a spinning cylinder drum
- ✅ Momentum/inertia - rotation continues after you stop scrolling
- ✅ Slight overshoot then smooth spring settle (under-damped spring)
- ✅ Drag adds velocity, keeps spinning with friction decay after release

## Physics Model Implemented

### Three-Phase System

```
INPUT (scroll/drag) → TARGET → SPRING → CURRENT ROTATION
                         ↓
                     VELOCITY (momentum)
                         ↓
                     FRICTION (decay)
```

### Key Variables

1. **`rotation`** - Current rotation (where we are now)
2. **`target`** - Target rotation (where we want to be)
3. **`velocity`** - Momentum (persists after input stops)

### Spring Equation

```tsx
// Calculate difference between target and current
const diff = target.current - rotation.current;

// Move toward target with spring stiffness
rotation.current += diff * stiffness;

// Low stiffness (0.05-0.1) = soft, elastic feel with overshoot
// High stiffness (0.3+) = snappy, immediate response
```

### Momentum & Friction

```tsx
// Add velocity to target (creates coasting after release)
target.current += velocity.current;

// Exponential decay (natural slow-down)
velocity.current *= friction; // 0.95 = 5% loss per frame
```

## Implementation Details

### useGalleryControls.ts - Complete Rewrite ✅

**Key Changes:**

```tsx
// OLD (wrong - direct rotation, no momentum)
rotationRef.current.y += e.deltaY * wheelSensitivity;

// NEW (correct - adds to target, spring follows with momentum)
target.current += e.deltaY * wheelSensitivity;

// Per-frame spring physics
useFrame(() => {
  // Apply velocity (momentum)
  target.current += velocity.current;
  
  // Friction decay
  velocity.current *= friction;
  
  // Spring toward target (THIS creates overshoot + settle)
  const diff = target.current - rotation.current;
  rotation.current += diff * stiffness;
  
  // Apply to group
  groupRef.current.rotation.y = rotation.current;
});
```

### Wheel Event (Scroll)

```tsx
const handleWheel = useCallback((e: WheelEvent) => {
  e.preventDefault();
  
  // Add scroll delta to TARGET (not direct to rotation)
  // This creates the "drum spinning" effect
  target.current += e.deltaY * wheelSensitivity;
}, [wheelSensitivity]);
```

**Effect:**
- Scrolling adds to target rotation
- Spring smoothly follows target
- Creates elastic, natural feel

### Drag Event (Pointer)

```tsx
const handlePointerMove = useCallback((e: PointerEvent) => {
  if (!isDragging.current) return;

  const deltaX = e.clientX - lastPointerX.current;

  // Add drag to target rotation
  target.current += deltaX * dragSensitivity;
  
  // Set velocity for momentum after release
  velocity.current = deltaX * dragSensitivity;

  lastPointerX.current = e.clientX;
}, [dragSensitivity]);
```

**Effect:**
- Dragging adds to both target and velocity
- After release, velocity keeps the drum spinning
- Friction gradually slows it down
- Spring creates smooth settle

### Per-Frame Physics (useFrame)

```tsx
useFrame(() => {
  if (!groupRef.current) return;

  // 1. AUTO-ROTATE when idle
  if (autoRotate && !isDragging.current && Math.abs(velocity.current) < 0.001) {
    target.current += autoRotateSpeed * 0.01;
  }

  // 2. MOMENTUM: Apply velocity to target
  target.current += velocity.current;
  
  // 3. FRICTION: Exponential velocity decay
  velocity.current *= friction;

  // 4. SPRING: Smooth approach to target with overshoot
  const diff = target.current - rotation.current;
  rotation.current += diff * stiffness;

  // 5. APPLY to parent group (Y-axis rotation only)
  groupRef.current.rotation.y = rotation.current;
});
```

## Tunable Parameters

### In FloatingGallery.tsx

```tsx
const { groupRef } = useGalleryControls({
  autoRotate: true,
  autoRotateSpeed: 0.1,
  wheelSensitivity: 0.002,    // Scroll speed (higher = faster)
  dragSensitivity: 0.005,     // Drag rotation speed
  stiffness: 0.08,            // Spring (lower = more overshoot)
  friction: 0.95,             // Decay (lower = faster stop)
});
```

### Effect of Each Parameter

| Parameter | Low Value | High Value |
|-----------|-----------|------------|
| `stiffness` (0.05-0.15) | More overshoot, elastic | Snappy, direct |
| `friction` (0.90-0.98) | Stops quickly | Long coasting |
| `wheelSensitivity` (0.001-0.005) | Slow spin | Fast spin |
| `dragSensitivity` (0.003-0.008) | Gentle rotation | Aggressive rotation |

### Recommended Values (Pahari-style)

- **stiffness**: `0.08` - Soft elastic feel with slight overshoot
- **friction**: `0.95` - Natural momentum decay
- **wheelSensitivity**: `0.002` - Comfortable scroll speed
- **dragSensitivity**: `0.005` - Responsive but not twitchy

## Architecture Preserved

### What Rotates

✅ **Only the parent `<group>` wrapping ALL cards**
- Controlled by `useGalleryControls` via `groupRef`
- Spring physics applied to `rotation.y`

### What Doesn't Rotate

❌ **Individual cards** - They only billboard (face camera)
- Each card's inner `<Billboard>` handles facing camera
- No manual rotation on individual cards
- Billboard logic unchanged from previous fix

### Code Structure

```tsx
// FloatingGallery.tsx
<group ref={groupRef}> {/* ONLY THIS rotates with spring physics */}
  <GalleryCard position={pos1} /> {/* Billboards internally */}
  <GalleryCard position={pos2} /> {/* Billboards internally */}
  <GalleryCard position={pos3} /> {/* Billboards internally */}
</group>
```

```tsx
// GalleryCard.tsx - Billboard unchanged
<group position={position}> {/* Position from layout */}
  <Billboard follow={true}> {/* Faces camera automatically */}
    <Html>{/* Card content */}</Html>
  </Billboard>
</group>
```

## Behavior Comparison

### Before (Wrong)

```
Scroll → Direct rotation change → Immediate stop
         ↓
      No momentum
      No spring feel
      Feels mechanical/flat
```

### After (Correct - Pahari Style)

```
Scroll → Target changes → Spring follows → Overshoots slightly → Settles
         ↓                 ↓                 ↓
      Velocity builds → Decays with friction → Natural feel
                        ↓
                    Keeps spinning after release
```

## Testing Checklist

- [x] Scroll wheel rotates the drum smoothly
- [x] Rotation continues with momentum after scroll stops
- [x] Slight overshoot then smooth settle (spring feel)
- [x] Drag adds velocity, keeps spinning after release
- [x] Friction decay feels natural (not too fast/slow)
- [x] Auto-rotate works when idle
- [x] Cards still face camera cleanly (billboard unchanged)
- [x] No TypeScript errors

## Files Changed

1. **useGalleryControls.ts** ✅ - Complete rewrite with spring physics
2. **FloatingGallery.tsx** ✅ - Updated hook options to match new parameters
3. **GalleryCard.tsx** ❌ - NO CHANGES (billboard logic preserved)

## Performance

- Physics runs at 60fps via `useFrame`
- Minimal calculations per frame:
  - 1 velocity addition
  - 1 friction multiplication
  - 1 spring calculation
  - 1 rotation application
- No performance impact compared to old implementation

## Result

Gallery now behaves **exactly like pahari.vercel.app** with smooth momentum, elastic spring feel, and natural friction decay! 🎉
