/** One cluster (lane) or domain (plane) of a Zwicky box: its key, caption and RGB colour (0..1). */
export interface ZwickyGroup {
	id: string;
	label: string;
	color: readonly [number, number, number];
}
