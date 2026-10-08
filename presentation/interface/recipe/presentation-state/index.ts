import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { PresentationMode } from '$stylist/presentation/type/alias/presentation-mode/index';
export interface RecipePresentationState extends ComputeIntersectAll<[]> {
	mode: PresentationMode;
	currentFrameIndex: number;
	frames: {
		id: string;
		title: string;
		targetX: number;
		targetY: number;
		targetZoom: number;
		duration?: number;
	}[];
	isPlaying: boolean;
}
