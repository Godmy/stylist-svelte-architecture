import type { HTMLAttributes } from 'svelte/elements';
import { createEventDispatcher } from 'svelte';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
import type { RecipeGraphNodeCard } from '$stylist/workspace/interface/recipe/graph-node-card';

export function createGraphNodeCardState(
	getProps: () => RecipeGraphNodeCard & HTMLAttributes<HTMLDivElement>
) {
	const props = $derived(getProps());
	const dispatch = createEventDispatcher<{
		toggleExpand: { node: SlotWorkspaceNode };
		viewDetails: { node: SlotWorkspaceNode };
		addField: { node: SlotWorkspaceNode };
		fieldClick: { field: { name: string; type: string; isRequired?: boolean } };
	}>();

	let isExpanded = $state(props.expanded ?? false);

	$effect(() => {
		isExpanded = props.expanded ?? false;
	});

	const containerClass = $derived(
		[
			'graph-node-card',
			(props.selected ?? false) && 'graph-node-card--selected',
			(props.highlight ?? false) ? 'graph-node-card--highlight' : 'graph-node-card--default',
			props.class ?? ''
		]
			.filter(Boolean)
			.join(' ')
	);

	const restProps = $derived.by(() => {
		const {
			node: _node,
			expanded: _expanded,
			showDetails: _showDetails,
			selected: _selected,
			highlight: _highlight,
			variant: _variant,
			size: _size,
			id: _id,
			name: _name,
			type: _type,
			description: _description,
			fields: _fields,
			class: _class,
			children: _children,
			...rest
		} = props;
		return rest;
	});

	function getIconName(type: string) {
		switch (type) {
			case 'object':
				return 'object';
			case 'interface':
				return 'interface';
			case 'union':
				return 'union';
			case 'enum':
				return 'enum';
			case 'scalar':
				return 'scalar';
			case 'input':
				return 'input';
			default:
				return 'default';
		}
	}

	function toggleExpanded() {
		isExpanded = !isExpanded;
		dispatch('toggleExpand', { node: props.node });
	}

	function handleFieldClick(field: { name: string; type: string; isRequired?: boolean }) {
		dispatch('fieldClick', { field });
	}

	function handleViewDetails() {
		dispatch('viewDetails', { node: props.node });
	}

	function handleAddField() {
		dispatch('addField', { node: props.node });
	}

	return {
		get isExpanded() {
			return isExpanded;
		},
		get containerClass() {
			return containerClass;
		},
		get restProps() {
			return restProps;
		},
		get headerClass() {
			return 'graph-node-card__header';
		},
		get titleClass() {
			return 'graph-node-card__title';
		},
		get typeClass() {
			return 'graph-node-card__type';
		},
		get contentClass() {
			return 'graph-node-card__content';
		},
		get descriptionClass() {
			return 'graph-node-card__description';
		},
		get fieldsListClass() {
			return 'graph-node-card__fields';
		},
		get fieldItemClass() {
			return 'graph-node-card__field-item';
		},
		get fieldNameClass() {
			return 'graph-node-card__field-name';
		},
		get fieldTypeClass() {
			return 'graph-node-card__field-type';
		},
		get fieldRequiredClass() {
			return 'graph-node-card__field-required';
		},
		get actionsClass() {
			return 'graph-node-card__actions';
		},
		getIconName,
		toggleExpanded,
		handleFieldClick,
		handleViewDetails,
		handleAddField
	};
}
