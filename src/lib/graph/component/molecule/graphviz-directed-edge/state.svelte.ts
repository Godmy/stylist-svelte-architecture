import type { RecipeGraphvizDirectedEdge } from '$stylist/graph/interface/recipe/graphviz-directed-edge';

export function createGraphvizDirectedEdgeState(getProps: () => RecipeGraphvizDirectedEdge) {
	const props = $derived(getProps());
	const id = $derived(props.id);
	const sourceX = $derived(props.sourceX ?? 0);
	const sourceY = $derived(props.sourceY ?? 0);
	const targetX = $derived(props.targetX ?? 100);
	const targetY = $derived(props.targetY ?? 100);
	const text = $derived(props.text ?? '');
	const color = $derived(props.color ?? 'var(--color-text-primary)');
	const width = $derived(props.width ?? 2);
	const strokeStyle = $derived(props.style ?? 'solid');
	const dashArray = $derived(
		strokeStyle === 'dashed' ? '5,5' : strokeStyle === 'dotted' ? '2,2' : 'none'
	);
	const rootClass = $derived(
		typeof props.class === 'string'
			? `graphviz-directed-edge ${props.class}`
			: 'graphviz-directed-edge'
	);
	const labelX = $derived((sourceX + targetX) / 2);
	const labelY = $derived((sourceY + targetY) / 2 - 10);

	return {
		get id() {
			return id;
		},
		get sourceX() {
			return sourceX;
		},
		get sourceY() {
			return sourceY;
		},
		get targetX() {
			return targetX;
		},
		get targetY() {
			return targetY;
		},
		get text() {
			return text;
		},
		get color() {
			return color;
		},
		get width() {
			return width;
		},
		get dashArray() {
			return dashArray;
		},
		get rootClass() {
			return rootClass;
		},
		get labelX() {
			return labelX;
		},
		get labelY() {
			return labelY;
		}
	};
}

export default createGraphvizDirectedEdgeState;
