import type { SlotWorkspaceNode as WorkspacePaletteItem } from '$stylist/workspace/interface/slot/workspace-node';
import type { RecipeWorkspacePalette as WorkspacePaletteProps } from '$stylist/workspace/interface/recipe/workspace-palette';

export class ObjectManagerWorkspacePalette {
	static readonly defaultCategories = [
		'all',
		'default',
		'source',
		'processor',
		'output',
		'gateway',
		'custom'
	] as const;

	static filterItems(
		items: readonly WorkspacePaletteItem[],
		selectedCategory: string,
		searchQuery: string
	): WorkspacePaletteItem[] {
		let result = [...items];

		if (selectedCategory !== 'all') {
			result = result.filter((item) => item.category === selectedCategory);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(item) =>
					(item.title ?? '').toLowerCase().includes(query) ||
					item.description?.toLowerCase().includes(query) ||
					(item.type ?? '').toLowerCase().includes(query)
			);
		}

		return result;
	}

	static groupItems(
		items: readonly WorkspacePaletteItem[],
		viewMode: NonNullable<WorkspacePaletteProps['viewMode']>
	): Record<string, WorkspacePaletteItem[]> {
		if (viewMode !== 'list') {
			return { all: [...items] };
		}

		return items.reduce<Record<string, WorkspacePaletteItem[]>>((groups, item) => {
			const category = item.category ?? 'default';
			if (!groups[category]) {
				groups[category] = [];
			}

			groups[category].push(item);
			return groups;
		}, {});
	}

	static getCategories(categories?: readonly string[]): readonly string[] {
		return categories?.length ? categories : ObjectManagerWorkspacePalette.defaultCategories;
	}

	static getCategoryLabel(category: string): string {
		return category === 'all' ? 'All' : category;
	}

	static toggleViewMode(viewMode: NonNullable<WorkspacePaletteProps['viewMode']>): 'grid' | 'list' {
		return viewMode === 'grid' ? 'list' : 'grid';
	}
}
