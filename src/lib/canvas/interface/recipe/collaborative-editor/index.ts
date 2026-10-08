import type { HTMLAttributes } from 'svelte/elements';
export interface RecipeCollaborativeEditor extends HTMLAttributes<HTMLDivElement> {
	content?: string;
	users?: {
		id: string;
		name: string;
		color: string;
		avatar?: string;
	}[];
	currentUser?: {
		id: string;
		name: string;
		color: string;
		avatar?: string;
	};
	onContentChange?: (content: string) => void;
	showToolbar?: boolean;
	showUserList?: boolean;
	class?: string;
	toolbarClass?: string;
	editorClass?: string;
	userListClass?: string;
}
