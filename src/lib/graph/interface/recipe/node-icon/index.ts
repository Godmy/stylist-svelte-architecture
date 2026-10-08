import type { HTMLAttributes } from 'svelte/elements';
export interface RecipeNodeIcon extends HTMLAttributes<HTMLDivElement> {
	icon?: string;
	size?: number;
	accent?: string;
	background?: string;
}
