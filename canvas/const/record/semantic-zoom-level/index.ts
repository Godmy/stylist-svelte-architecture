import type { FoundationSemanticZoomStage } from '$stylist/canvas/type/alias/foundation-semantic-zoom-stage';
import type { TierContent } from '$stylist/layout/type/alias/tier';

export const RECORD_LEVEL: Record<FoundationSemanticZoomStage, TierContent> = {
	dot: 'dot',
	icon: 'icon',
	pill: 'minimal',
	minimal: 'minimal',
	compact: 'compact',
	detailed: 'detailed',
	screen: 'screen'
};
