import type { RecipeOntologyNodeComponent } from '$stylist/graph/interface/recipe/ontology-node-component';
import type { TokenIconName } from '$stylist/svg/type/alias/icon-name';

const NODE_ICON_MAP: Record<string, TokenIconName> = {
	class: 'square',
	'object-property': 'arrow-right',
	'datatype-property': 'cabinet-database',
	datatype: 'type',
	deprecated: 'x',
	'equivalent-class': 'zap'
};

export function createOntologyNodeComponentState(getProps: () => RecipeOntologyNodeComponent) {
	const props = $derived(getProps());
	const nodeType = $derived(props.node.type);
	const baseClasses = $derived(
		['ontology-node-component', `ontology-node-component--${nodeType}`, props.class ?? '']
			.filter(Boolean)
			.join(' ')
	);
	const iconName = $derived(NODE_ICON_MAP[nodeType] ?? 'circle');
	const label = $derived(props.node.label || props.node.id);

	return {
		get baseClasses() {
			return baseClasses;
		},
		get iconName() {
			return iconName;
		},
		get label() {
			return label;
		}
	};
}

export default createOntologyNodeComponentState;
