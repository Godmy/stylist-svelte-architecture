import type { SceneNode } from '$stylist/canvas/interface/slot/scene-node';
import { SemanticZoomManager } from '$stylist/canvas/class/manager/semantic-zoom';
export function useSemanticZoom(
	params:
		| {
				worldDepth: number;
				cameraDepth: number;
		  }
		| {
				node: SceneNode;
				cameraDepth: number;
		  }
) {
	const readPresentation = () => {
		if ('node' in params) {
			return SemanticZoomManager.resolvePresentation(params.node.depth, params.cameraDepth);
		}

		return SemanticZoomManager.resolvePresentation(params.worldDepth, params.cameraDepth);
	};

	return {
		get presentation() {
			return readPresentation();
		},
		get stage() {
			return readPresentation().stage;
		},
		get layer() {
			return readPresentation().layer;
		}
	};
}
