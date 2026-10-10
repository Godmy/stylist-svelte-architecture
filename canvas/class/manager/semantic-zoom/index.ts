import { RECORD_DENSITY } from '$stylist/canvas/const/record/semantic-zoom-density/index';
import { RECORD_FRAME } from '$stylist/canvas/const/record/semantic-zoom-frame/index';
import { RECORD_LAYER } from '$stylist/canvas/const/record/semantic-zoom-layer/index';
import { RECORD_LEVEL } from '$stylist/canvas/const/record/semantic-zoom-level/index';
import { RECORD_SHAPE } from '$stylist/canvas/const/record/semantic-zoom-shape/index';
import { RECORD_SIZE } from '$stylist/canvas/const/record/semantic-zoom-size/index';
import { FoundationManager } from '$stylist/canvas/class/manager/foundation';
import type { SceneNode } from '$stylist/canvas/interface/slot/scene-node';
import type { SemanticZoomPresentation } from '$stylist/canvas/interface/slot/semantic-zoom';
import type { FoundationSemanticZoomStage } from '$stylist/canvas/type/alias/foundation-semantic-zoom-stage';

export class SemanticZoomManager {
	static resolvePresentation(worldDepth: number, cameraDepth: number): SemanticZoomPresentation {
		const distance = FoundationManager.getDepthDistance(worldDepth, cameraDepth);
		const proximity = FoundationManager.normalizeDepthDistance(distance);
		const stage: FoundationSemanticZoomStage = FoundationManager.resolveSemanticZoomStage(
			worldDepth,
			cameraDepth
		);
		const frame = RECORD_FRAME[stage];

		return {
			stage,
			layer: RECORD_LAYER[stage],
			architecture: RECORD_LEVEL[stage],
			shape: RECORD_SHAPE[stage],
			density: RECORD_DENSITY[stage],
			size: RECORD_SIZE[stage],
			showIcon: stage !== 'dot',
			showLabel: stage !== 'dot' && stage !== 'icon',
			showDescription: stage === 'compact' || stage === 'detailed' || stage === 'screen',
			showChildren: stage === 'detailed' || stage === 'screen',
			width: frame.width,
			height: frame.height,
			scale: 0.8 + proximity * 0.45,
			distance,
			proximity
		};
	}

	static resolveNode(
		node: SceneNode,
		cameraDepth: number
	): SemanticZoomPresentation & { node: SceneNode } {
		return {
			node,
			...SemanticZoomManager.resolvePresentation(node.depth, cameraDepth)
		};
	}
}
