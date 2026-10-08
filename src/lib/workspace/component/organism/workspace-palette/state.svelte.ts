import { ObjectManagerWorkspacePalette } from '$stylist/workspace/class/manager/workspace-palette';
import type { SlotWorkspaceNode as WorkspacePaletteItem } from '$stylist/workspace/interface/slot/workspace-node';
import type { RecipeWorkspacePalette as WorkspacePaletteProps } from '$stylist/workspace/interface/recipe/workspace-palette';

export function createWorkspacePaletteState(props: WorkspacePaletteProps) {
	const filteredItems = $derived(
		ObjectManagerWorkspacePalette.filterItems(
			props.items ?? [],
			props.selectedCategory ?? 'all',
			props.searchQuery ?? ''
		)
	);

	const groupedItems = $derived(
		ObjectManagerWorkspacePalette.groupItems(filteredItems, props.viewMode ?? 'list')
	);

	const categories = $derived(ObjectManagerWorkspacePalette.getCategories(props.categories));
	const rootClass = $derived(
		props.class ? `workspace-palette ${props.class}` : 'workspace-palette'
	);
	const paletteStyle = $derived(
		`--palette-x: ${props.x ?? 0}px; --palette-y: ${props.y ?? 0}px; --palette-width: ${props.width ?? 320}px; --palette-height: ${props.height ?? 480}px;`
	);

	const handleSearch = (value: string) => {
		props.onSearch?.(value);
	};

	const handleNodeClick = (item: WorkspacePaletteItem) => {
		props.onNodeSelect?.(item);
	};

	const handleClose = () => {
		props.onClose?.();
	};

	const handleViewModeToggle = () => {
		props.onViewModeChange?.(
			ObjectManagerWorkspacePalette.toggleViewMode(props.viewMode ?? 'list')
		);
	};

	const handleCategorySelect = (category: string) => {
		props.onCategorySelect?.(category);
	};

	return {
		get filteredItems() {
			return filteredItems;
		},
		get groupedItems() {
			return groupedItems;
		},
		get categories() {
			return categories;
		},
		get rootClass() {
			return rootClass;
		},
		get paletteStyle() {
			return paletteStyle;
		},
		getCategoryLabel(category: string) {
			return ObjectManagerWorkspacePalette.getCategoryLabel(category);
		},
		handleSearch,
		handleNodeClick,
		handleClose,
		handleViewModeToggle,
		handleCategorySelect
	};
}

export default createWorkspacePaletteState;
