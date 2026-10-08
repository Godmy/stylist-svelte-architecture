export const ZWICKY_LAYOUT_SCALE = {
	// Horizontal matrix layout: X = cluster lane, Z = domain row
	clusterXSpacing: 32,
	clusterXFirst: -96, // X position of 'data' lane (leftmost)
	domainZStep: 7, // Z spacing between sorted domains
	laneScatterX: 9, // max X jitter within lane (< half spacing)
	laneScatterY: 11, // vertical spread per cell
	laneScatterZ: 2.2, // Z jitter within domain slice
	domainRadius: 24,
	familyMaxRadius: 16,
	goldenAngle: 2.39996323,
	cameraMinRadius: 3,
	cameraMaxRadius: 400,
	cameraInitRadius: 180
} as const;
