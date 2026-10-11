import type { FoundationSemanticZoomStage } from '$stylist/canvas/type/alias/foundation-semantic-zoom-stage';
import type { TierContent } from '$stylist/layout/type/alias/tier';
import type { TokenDensity } from '$stylist/layout/type/alias/density';
import type { TokenShape } from '$stylist/layout/type/alias/shape';
import type { TokenSize } from '$stylist/design-token/type/alias/size';
import type { TokenZIndex } from '$stylist/design-token/type/alias/z-index';

export interface SemanticZoomPresentation {
	stage: FoundationSemanticZoomStage;
	layer: TokenZIndex;
	architecture: TierContent;
	shape: TokenShape;
	density: TokenDensity;
	size: TokenSize;
	showIcon: boolean;
	showLabel: boolean;
	showDescription: boolean;
	showChildren: boolean;
	width: number;
	height: number;
	scale: number;
	distance: number;
	proximity: number;
}
