import type { HTMLAttributes } from 'svelte/elements';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { CanvasUser } from '$stylist/canvas/type/object/canvas-user';
export interface RecipeCollaborativeEditor extends ComputeIntersectAll<
	[HTMLAttributes<HTMLDivElement>]
> {
	content?: string;
	users?: CanvasUser[];
	currentUser?: CanvasUser;
	onContentChange?: (content: string) => void;
	showToolbar?: boolean;
	showUserList?: boolean;
	class?: string;
	toolbarClass?: string;
	editorClass?: string;
	userListClass?: string;
}
