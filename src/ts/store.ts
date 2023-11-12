import type { Application, ICanvas } from 'pixi.js';
import type { PIXIMapGraph } from '@components/MapGraph';
import type { MapBounds } from '@components/MapGraph/MapBounds';
import { atom } from 'nanostores';

export const PIXIAppStore = atom<Application<ICanvas> | null>(null);
export const PIXIGraphStore = atom<PIXIMapGraph | null>(null);
export const mapBoundsStore = atom<MapBounds | null>(null);

export const dropAreaStore = atom<HTMLElement | null>(null);
