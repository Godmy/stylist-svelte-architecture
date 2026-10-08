import type { SlotGraphEdge } from '$stylist/graph/interface/slot/graph-edge';
import type { SlotFieldHighlighterSelectedField } from '$stylist/graph/interface/slot/field-highlighter-selected-field';
import type { SlotGraphNode } from '$stylist/graph/interface/slot/graph-node';
export interface SlotFieldHighlighter {
	data: {
		nodes: SlotGraphNode[];
		edges: SlotGraphEdge[];
	};
	selectedNode?: SlotGraphNode | null;
	selectedField?: SlotFieldHighlighterSelectedField | null;
	onNodeClick?: (node: SlotGraphNode) => void;
	onFieldClick?: (node: SlotGraphNode, field: SlotFieldHighlighterSelectedField) => void;
}
