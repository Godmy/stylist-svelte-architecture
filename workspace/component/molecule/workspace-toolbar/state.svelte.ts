import { ClassNamesManager } from '$stylist/layout/class/manager/class-names';
import type { TokenSize } from '$stylist/theme/type/alias/size';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
import type { RecipeWorkspaceToolbar } from '$stylist/workspace/interface/recipe/workspace-toolbar';

export function createWorkspaceToolbarState(getProps: () => RecipeWorkspaceToolbar) {
	const props = $derived(getProps());
	const items = $derived(props.items ?? []);
	const size = $derived((props.size ?? 'md') as TokenSize);
	const orientation = $derived(props.orientation ?? 'horizontal');
	const compact = $derived(props.compact ?? false);
	const showTooltips = $derived(props.showTooltips ?? true);
	const classes = $derived(
		ClassNamesManager.merge(
			'workspace-toolbar',
			orientation === 'vertical' ? 'workspace-toolbar--vertical' : 'workspace-toolbar--horizontal',
			compact && 'workspace-toolbar--compact',
			typeof props.class === 'string' ? props.class : ''
		)
	);
	const restProps = $derived.by(() => {
		const {
			class: _class,
			id: _id,
			items: _items,
			size: _size,
			orientation: _orientation,
			compact: _compact,
			showTooltips: _showTooltips,
			onItemClick: _onItemClick,
			onValueChange: _onValueChange,
			children: _children,
			...rest
		} = props;
		return rest;
	});

	function handleItemClick(item: SlotWorkspaceNode): void {
		item.onclick?.();
		if (item.id) props.onItemClick?.(item.id);
	}

	function handleValueChange(item: SlotWorkspaceNode, value: unknown): void {
		if (item.id) props.onValueChange?.(item.id, value);
	}

	return {
		get items() {
			return items;
		},
		get size() {
			return size;
		},
		get orientation() {
			return orientation;
		},
		get compact() {
			return compact;
		},
		get showTooltips() {
			return showTooltips;
		},
		get classes() {
			return classes;
		},
		get restProps() {
			return restProps;
		},
		handleItemClick,
		handleValueChange
	};
}

export default createWorkspaceToolbarState;
