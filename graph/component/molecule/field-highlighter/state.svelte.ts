import type { SlotFieldHighlighter as IFieldHighlighterProps } from '$stylist/graph/interface/slot/field-highlighter';
import type { SlotFieldHighlighterSelectedField as IFieldHighlighterSelectedField } from '$stylist/graph/interface/slot/field-highlighter-selected-field';
import type { SlotGraphEdge as IGraphEdge } from '$stylist/graph/interface/slot/graph-edge';
import type { SlotGraphNode as IGraphNode } from '$stylist/graph/interface/slot/graph-node';

export const createFieldHighlighterState = (getProps: () => IFieldHighlighterProps) => {
	const props = $derived(getProps());
	function handleNodeClick(node: IGraphNode) {
		props.onNodeClick?.(node);
	}

	function handleFieldClick(node: IGraphNode, field: IFieldHighlighterSelectedField) {
		props.onFieldClick?.(node, field);
	}

	function isNodeHighlighted(node: IGraphNode) {
		if (!props.selectedField) {
			return false;
		}

		return (
			props.selectedNode?.id === node.id ||
			(node.label ? node.label.includes(props.selectedField.name) : false)
		);
	}

	function isEdgeHighlighted(edge: IGraphEdge) {
		if (!props.selectedField || !props.selectedNode) {
			return false;
		}

		return edge.fromNodeId === props.selectedNode.id || edge.toNodeId === props.selectedNode.id;
	}

	return {
		get data() {
			return props.data;
		},
		get selectedNode() {
			return props.selectedNode ?? null;
		},
		get selectedField() {
			return props.selectedField ?? null;
		},
		handleNodeClick,
		handleFieldClick,
		isNodeHighlighted,
		isEdgeHighlighted
	};
};

export default createFieldHighlighterState;
