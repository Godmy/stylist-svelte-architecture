import type { HTMLAttributes } from 'svelte/elements';
import type { SlotChildren } from '$stylist/theme/interface/slot/children';
import type { SlotWorkspaceNode } from '$stylist/workspace/interface/slot/workspace-node';
import type { ComputeIntersectAll } from '$stylist/theme/type/compute/intersect-all';
import type { SlotDimensionable } from '$stylist/layout/interface/slot/dimensionable';
export interface RecipeWorkspacePalette
	extends ComputeIntersectAll<[HTMLAttributes<HTMLDivElement>, SlotChildren, SlotDimensionable]> {
	items?: readonly SlotWorkspaceNode[];
	categories?: readonly string[];

	isOpen?: boolean;
	x?: number;
	y?: number;
	searchQuery?: string;
	viewMode?: 'grid' | 'list';
	selectedCategory?: string;
	dismissible?: boolean;
	onSearch?: (query: string) => void;
	onNodeSelect?: (item: SlotWorkspaceNode) => void;
	onClose?: () => void;
	onViewModeChange?: (mode: 'grid' | 'list') => void;
	onCategorySelect?: (category: string) => void;
	class?: string;
}
