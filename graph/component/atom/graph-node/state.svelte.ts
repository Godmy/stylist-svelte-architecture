import type { RecipeGraphNode } from '$stylist/graph/interface/recipe/graph-node';
import type { TokenSize } from '$stylist/theme/type/alias/size';

const GRAPH_NODE_SIZE_MAP: Partial<Record<TokenSize, string>> = {
	xs: 'graph-node graph-node--xs',
	sm: 'graph-node graph-node--sm',
	md: 'graph-node graph-node--md',
	lg: 'graph-node graph-node--lg',
	xl: 'graph-node graph-node--xl'
};

export function createGraphNodeState(getProps: () => RecipeGraphNode) {
	const props = $derived(getProps());
	const size = $derived((props.size ?? 'md') as TokenSize);
	const color = $derived(props.color ?? 'var(--color-primary-500)');
	const selected = $derived(Boolean(props.selected));
	const positionStyle = $derived(
		`left: ${props.x ?? 0}px; top: ${props.y ?? 0}px; transform: translate(-50%, -50%);`
	);
	const sizeClasses = $derived(GRAPH_NODE_SIZE_MAP[size] ?? 'graph-node graph-node--md');
	const stateClasses = $derived(selected ? 'graph-node graph-node--selected' : 'graph-node');
	const style = $derived(`${positionStyle}; --graph-node-color: ${color};`);

	return {
		get size() {
			return size;
		},
		get selected() {
			return selected;
		},
		get sizeClasses() {
			return sizeClasses;
		},
		get stateClasses() {
			return stateClasses;
		},
		get style() {
			return style;
		}
	};
}

export default createGraphNodeState;
