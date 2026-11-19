export type SchemaDependencyRoute = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	pathData: string;
	points: { x: number; y: number }[];
	/** Shared target approach: these final vertices remain fixed during relaxation. */
	lockedTailPoints?: number;
};
