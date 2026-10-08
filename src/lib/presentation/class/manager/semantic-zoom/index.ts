import { RECORD_DENSITY } from '$stylist/presentation/const/record/density/index';
import { RECORD_FRAME } from '$stylist/presentation/const/record/frame/index';
import { RECORD_LAYER } from '$stylist/presentation/const/record/layer/index';
import { RECORD_LEVEL } from '$stylist/presentation/const/record/level/index';
import { RECORD_SHAPE } from '$stylist/presentation/const/record/shape/index';
import { RECORD_SIZE } from '$stylist/presentation/const/record/size/index';
import { FoundationManager } from '$stylist/presentation/class/manager/foundation';
import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';
import type { SemanticZoomPresentation } from '$stylist/presentation/interface/slot/semantic-zoom';
import type { FoundationSemanticZoomStage } from '$stylist/presentation/type/alias/foundation-semantic-zoom-stage';

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
