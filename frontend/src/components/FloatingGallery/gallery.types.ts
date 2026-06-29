/**
 * Shared TypeScript types for the FloatingGallery component
 */

import { Vector3 } from 'three';

/**
 * Data structure for a single gallery card
 */
export interface GalleryCardData {
  id: string | number;
  imageUrl: string;
  title: string;
  subtitle?: string;
  link?: string;
  onClick?: (card: GalleryCardData) => void;
}

/**
 * @deprecated Use GalleryCardData instead
 */
export type CardData = GalleryCardData;

/**
 * Layout type enum
 */
export type LayoutType = 'sphere' | 'cylinder' | 'scatter';

/**
 * Props for the main FloatingGallery component
 */
export interface FloatingGalleryProps {
  cards: GalleryCardData[];
  radius?: number;
  defaultLayout?: LayoutType;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  /** Big centered heading shown over the gallery (Pahari-style). Optional. */
  title?: string;
  /** Subtitle shown under the heading (e.g. "The Floating Gallery"). Optional. */
  subtitle?: string;
}

/**
 * Props for individual GalleryCard component
 */
export interface GalleryCardProps {
  card: GalleryCardData;
  position: Vector3;
  index: number;
  totalCards: number;
}

/**
 * Return type for layout calculation functions
 */
export type LayoutFunction = (totalCards: number, radius: number) => Vector3[];

/**
 * Gallery controls state
 */
export interface GalleryControlsState {
  rotation: { x: number; y: number };
  velocity: { x: number; y: number };
  isDragging: boolean;
}
