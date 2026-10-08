export interface GraphConnection {
	id: string;
	startId: string;
	endId: string;
	label?: string;
	strength?: number;
	accent?: readonly [number, number, number];
}
