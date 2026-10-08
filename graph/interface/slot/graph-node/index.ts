import type { Snippet } from 'svelte';
export interface SlotGraphNode {
	id: string;
	x: number;
	y: number;
	label?: string;
	children?: Snippet;
}
