import type { FoundationSemanticZoomStage } from '$stylist/presentation/type/alias/foundation-semantic-zoom-stage';
import type { TokenZIndex } from '$stylist/theme/type/alias/z-index';

export const RECORD_LAYER: Record<FoundationSemanticZoomStage, TokenZIndex> = {
	dot: 'layer3',
	icon: 'layer5',
	pill: 'layer20',
	minimal: 'layer20',
	compact: 'layer30',
	detailed: 'overlay',
	screen: 'modal'
};
