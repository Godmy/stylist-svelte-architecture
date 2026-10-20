export interface RecipeGraphDot {
	/** RGB color, every channel in `0..1`. */
	color: readonly [number, number, number];
	label: string;
	/** Dot diameter in px. */
	size?: number;
}
