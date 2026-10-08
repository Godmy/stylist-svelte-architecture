import type { FoundationSemanticZoomStage } from '$stylist/presentation/type/alias/foundation-semantic-zoom-stage';

export const RECORD_FRAME: Record<FoundationSemanticZoomStage, { width: number; height: number }> =
	{
		dot: { width: 16, height: 16 },
		icon: { width: 42, height: 42 },
		pill: { width: 144, height: 44 },
		minimal: { width: 192, height: 82 },
		compact: { width: 268, height: 152 },
		detailed: { width: 368, height: 238 },
		screen: { width: 520, height: 320 }
	};
