import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';
import type { CanvasUser } from '$stylist/canvas/type/object/canvas-user';
import type { CanvasObject } from '$stylist/canvas/type/alias/canvas-object';
import type { TokenSize } from '$stylist/design-token/type/alias/size';
import type { SlotDimensionable } from '$stylist/layout/interface/slot/dimensionable';

export interface RecipeSharedCanvas extends ComputeIntersectAll<
	[LayoutHTMLAttributes<HTMLDivElement>, SlotDimensionable]
> {
	objects?: CanvasObject[];
	users?: CanvasUser[];
	currentUserId?: string;
	currentUser?: CanvasUser;
	onObjectAdd?: (obj: CanvasObject) => void;
	onObjectUpdate?: (obj: CanvasObject) => void;
	onObjectDelete?: (id: string) => void;
	showUsers?: boolean;
	showToolbar?: boolean;
	toolbarClass?: string;
	canvasClass?: string;
	variant?: 'default' | 'minimal';
	size?: TokenSize;
	selectedTool?: string;
	selectedColor?: string;
	showZoomControls?: boolean;
}
