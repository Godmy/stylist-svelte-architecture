import type { TokenTrajectory } from '$stylist/workspace/type/alias/trajectory';
export interface SlotNodeConnection {
	id: string;
	fromNodeId?: string;
	toNodeId?: string;
	fromPort?: string;
	toPort?: string;
	startX?: number;
	startY?: number;
	endX?: number;
	endY?: number;
	type?: TokenTrajectory;
	color?: string;
	active?: boolean;
	label?: string;
	onclick?: () => void;
}
