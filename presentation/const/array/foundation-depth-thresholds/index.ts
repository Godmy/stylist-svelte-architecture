export const FOUNDATION_DEPTH_THRESHOLDS = [
	{ stage: 'screen', maxDistance: 36 },
	{ stage: 'detailed', maxDistance: 96 },
	{ stage: 'compact', maxDistance: 180 },
	{ stage: 'minimal', maxDistance: 300 },
	{ stage: 'pill', maxDistance: 440 },
	{ stage: 'icon', maxDistance: 620 },
	{ stage: 'dot', maxDistance: Number.POSITIVE_INFINITY }
] as const;
