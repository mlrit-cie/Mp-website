/**
 * Barrel export for FloatingGallery component
 * 
 * Usage:
 * import { FloatingGallery } from '@/components/FloatingGallery';
 * import type { CardData, LayoutType } from '@/components/FloatingGallery';
 */

export { FloatingGallery, default } from './FloatingGallery';
export { GalleryCard, CardPlaceholder } from './GalleryCard';
export { calculateSpherePositions } from './SphereLayout';
export { calculateCylinderPositions } from './CylinderLayout';
export { useGalleryControls } from './useGalleryControls';

export type {
  CardData,
  LayoutType,
  FloatingGalleryProps,
  GalleryCardProps,
  LayoutFunction,
  GalleryControlsState,
} from './gallery.types';
