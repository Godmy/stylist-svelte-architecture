import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { LayoutHTMLAttributes } from '$stylist/layout/interface/behavior/layout-html-attributes';
import type { AnyProperty } from '$stylist/layout/type/record/any-property';
import type { SlotCanvasObject } from '$stylist/canvas/interface/slot/canvas-object';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import type { SlotDimensionable } from '$stylist/layout/interface/slot/dimensionable';

export interface RecipeSharedCanvas
	extends ComputeIntersectAll<[LayoutHTMLAttributes<HTMLDivElement>, SlotDimensionable]> {
	objects?: SlotCanvasObject[];
	users?: AnyProperty[];
	currentUserId?: string;
	currentUser?: AnyProperty;
	onObjectAdd?: (obj: SlotCanvasObject) => void;
	onObjectUpdate?: (obj: SlotCanvasObject) => void;
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
