import type { FoundationSemanticZoomStage } from '$stylist/presentation/type/alias/foundation-semantic-zoom-stage';
import type { TokenDensity } from '$stylist/layout/type/alias/density';

export const RECORD_DENSITY: Record<FoundationSemanticZoomStage, TokenDensity> = {
	dot: 'compact',
	icon: 'compact',
	pill: 'compact',
	minimal: 'compact',
	compact: 'default',
	detailed: 'spacious',
	screen: 'spacious'
};
