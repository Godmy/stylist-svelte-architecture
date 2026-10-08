import type { FoundationSemanticZoomStage } from '$stylist/presentation/type/alias/foundation-semantic-zoom-stage';
import type { TokenSize } from '$stylist/theme/type/alias/index';

export const RECORD_SIZE: Record<FoundationSemanticZoomStage, TokenSize> = {
	dot: 'xs',
	icon: 'sm',
	pill: 'md',
	minimal: 'lg',
	compact: 'xl',
	detailed: '2xl',
	screen: 'full'
};
