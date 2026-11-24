import type { CanvasFont } from '$stylist/canvas/type/object/canvas-font';
import type { CanvasShapeKind } from '$stylist/canvas/type/alias/canvas-shape-kind';
import type { TokenIconName } from '$stylist/svg/type/alias/icon-name';

/** Current style of new objects on a shared canvas board. */
export type CanvasBoardStyle = {
	color: string;
	fill: string;
	stickyFill: string;
	strokeWidth: number;
	font: Required<Pick<CanvasFont, 'family' | 'size'>> & CanvasFont;
	shape: CanvasShapeKind;
	icon: TokenIconName;
};
