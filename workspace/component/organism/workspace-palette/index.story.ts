import WorkspacePalette from './index.svelte';
import type { RecipeWorkspacePalette } from '$stylist/workspace/interface/recipe/workspace-palette';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_NODE_TYPE } from '$stylist/workspace/const/array/node-type';

/** Palette of ontology nodes. */
export default {
	component: WorkspacePalette,
	title: 'WorkspacePalette',
	description: 'Palette of ontology nodes.',
	args: {
		items: [
			{
				id: '1',
				type: 'source',
				title: 'Data Source',
				description: 'Input data source node',
				icon: 'database',
				color: 'var(--color-primary-500)',
				category: 'source'
			},
			{
				id: '2',
				type: 'processor',
				title: 'Data Processor',
				description: 'Process and transform data',
				icon: 'cpu',
				color: 'var(--color-warning-500)',
				category: 'processor'
			},
			{
				id: '3',
				type: 'output',
				title: 'Data Output',
				description: 'Output data destination',
				icon: 'export',
				color: 'var(--color-success-500)',
				category: 'output'
			}
		],
		isOpen: true,
		viewMode: 'list',
		x: 20,
		y: 20,
		width: 320,
		height: 480,
		dismissible: true,
		searchQuery: '',
		selectedCategory: 'all'
	},
	controls: {
		// The palette's two layouts.
		viewMode: { type: 'select', options: ['list', 'grid'] },
		// Items are categorised by node type; 'all' disables the filter.
		selectedCategory: { type: 'select', options: ['all', ...TOKEN_NODE_TYPE] },
		searchQuery: { type: 'text' },
		isOpen: { type: 'boolean' },
		dismissible: { type: 'boolean' }
	},
	presets: {
		Grid: { viewMode: 'grid' },
		'Filtered Search': { searchQuery: 'data', selectedCategory: 'processor' }
	},
	// The palette is absolutely positioned inside its workspace.
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'position: relative; min-height: 560px; padding: var(--spacing-6); background: var(--color-background-secondary);'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeWorkspacePalette>;
