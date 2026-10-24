import type { SlotTheme } from '$stylist/theme/interface/slot/theme';

/** An IDEF0 arrow (ICOM); its role on each activity comes from the activity's lists. */
export interface Idef0Arrow {
	id: string;
	label: string;
	color?: string;
}

/** A function box: lists of arrow ids entering from the left (inputs), the top (controls),
 *  the bottom (mechanisms) and leaving on the right (outputs). */
export interface Idef0Activity {
	/** Node number shown in the corner: A0, A1, A2… */
	id: string;
	title: string;
	inputs?: string[];
	controls?: string[];
	outputs?: string[];
	mechanisms?: string[];
}

/**
 * IDEF0 node diagram: the activities step down a staircase; an output of one activity that
 * is an input or a control of a later one is drawn between them, every other arrow is a
 * boundary arrow from the left, top or bottom edge, or to the right edge. One activity
 * gives the A-0 context diagram.
 */
export interface RecipeIdef0Decomposition extends SlotTheme {
	arrows: Idef0Arrow[];
	activities: Idef0Activity[];
	title?: string;
	/** Box size in SVG units. */
	boxWidth?: number;
	boxHeight?: number;
	class?: string;
}
