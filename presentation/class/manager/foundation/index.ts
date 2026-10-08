import { FOUNDATION_DEPTH_THRESHOLDS } from '$stylist/presentation/const/array/foundation-depth-thresholds';
import { DEFAULT_FOUNDATION_CAMERA } from '$stylist/presentation/const/value/default-foundation-camera';
import { FOUNDATION_DEPTH_RANGE } from '$stylist/presentation/const/value/foundation-depth-range';
import type { SceneCamera } from '$stylist/graph/interface/slot/scene-camera';
import type { FoundationSemanticZoomStage } from '$stylist/presentation/type/alias/foundation-semantic-zoom-stage';

export class FoundationManager {
	static clampDepth(depth: number): number {
		return Math.min(FOUNDATION_DEPTH_RANGE.max, Math.max(FOUNDATION_DEPTH_RANGE.min, depth));
	}

	static createCameraState(overrides: Partial<SceneCamera> = {}): SceneCamera {
		return {
			...DEFAULT_FOUNDATION_CAMERA,
			...overrides,
			depth: FoundationManager.clampDepth(overrides.depth ?? DEFAULT_FOUNDATION_CAMERA.depth)
		};
	}

	static getCameraDepth(camera: SceneCamera): number {
		return FoundationManager.clampDepth(camera.depth ?? 500);
	}

	static getDepthDistance(worldDepth: number, cameraDepth: number): number {
		return Math.abs(
			FoundationManager.clampDepth(worldDepth) - FoundationManager.clampDepth(cameraDepth)
		);
	}

	static getCameraDistance(camera: SceneCamera, worldDepth: number): number {
		return FoundationManager.getDepthDistance(worldDepth, FoundationManager.getCameraDepth(camera));
	}

	static normalizeDepthDistance(distance: number): number {
		return 1 - Math.min(1, Math.max(0, distance / FOUNDATION_DEPTH_RANGE.max));
	}

	static normalizeValue(value: number, min: number, max: number): number {
		if (max <= min) {
			return 0;
		}

		return (value - min) / (max - min);
	}

	static resolveSemanticZoomStage(
		worldDepth: number,
		cameraDepth: number
	): FoundationSemanticZoomStage {
		const distance = FoundationManager.getDepthDistance(worldDepth, cameraDepth);
		return (
			FOUNDATION_DEPTH_THRESHOLDS.find(
				(threshold: { maxDistance: number; stage: FoundationSemanticZoomStage }) =>
					distance <= threshold.maxDistance
			)?.stage ?? 'dot'
		);
	}
}
