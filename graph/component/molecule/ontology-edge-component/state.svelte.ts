import type { RecipeOntologyEdgeComponent } from '$stylist/graph/interface/recipe/ontology-edge-component';

const EDGE_COLOR_MAP: Record<string, string> = {
	subClassOf: 'var(--color-info-500)',
	equivalentClass: 'var(--color-secondary-500)',
	disjointWith: 'var(--color-danger-500)',
	domain: 'var(--color-success-500)',
	range: 'var(--color-success-500)',
	subPropertyOf: 'var(--color-warning-500)'
};

const EDGE_DASH_MAP: Record<string, string> = {
	subClassOf: '5,5',
	equivalentClass: '2,6',
	disjointWith: '10,5',
	subPropertyOf: '5,5'
};

export function createOntologyEdgeComponentState(getProps: () => RecipeOntologyEdgeComponent) {
	const props = $derived(getProps());
	const startX = $derived(
		(props.sourceNode.position?.x || 0) + (props.sourceNode.width || 120) / 2
	);
	const startY = $derived(
		(props.sourceNode.position?.y || 0) + (props.sourceNode.height || 60) / 2
	);
	const endX = $derived((props.targetNode.position?.x || 0) + (props.targetNode.width || 120) / 2);
	const endY = $derived((props.targetNode.position?.y || 0) + (props.targetNode.height || 60) / 2);

	const strokeColor = $derived(
		EDGE_COLOR_MAP[props.edge.relationship] ?? 'var(--color-neutral-400)'
	);
	const strokeDasharray = $derived(EDGE_DASH_MAP[props.edge.relationship]);
	const markerId = $derived((): string => {
		switch (props.edge.relationship) {
			case 'subClassOf':
				return 'arrowhead-subclass';
			case 'equivalentClass':
				return 'arrowhead-equivalent';
			case 'disjointWith':
				return 'arrowhead-disjoint';
			case 'domain':
			case 'range':
				return 'arrowhead-domain-range';
			case 'subPropertyOf':
				return 'arrowhead-subproperty';
			default:
				return 'arrowhead-default';
		}
	});
	const containerClass = $derived(
		props.class ? `ontology-edge-component ${props.class}` : 'ontology-edge-component'
	);

	return {
		get startX() {
			return startX;
		},
		get startY() {
			return startY;
		},
		get endX() {
			return endX;
		},
		get endY() {
			return endY;
		},
		get strokeColor() {
			return strokeColor;
		},
		get strokeDasharray() {
			return strokeDasharray;
		},
		get markerId() {
			return markerId();
		},
		get containerClass() {
			return containerClass;
		}
	};
}

export default createOntologyEdgeComponentState;
