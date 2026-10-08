import type { FoundationSemanticZoomStage } from '$stylist/presentation/type/alias/foundation-semantic-zoom-stage';
import type { TokenShape } from '$stylist/layout/type/alias/shape';

export const RECORD_SHAPE: Record<FoundationSemanticZoomStage, TokenShape> = {
	dot: 'circle',
	icon: 'square',
	pill: 'pill',
	minimal: 'rectangle',
	compact: 'rectangle',
	detailed: 'rectangle',
	screen: 'rectangle'
};
