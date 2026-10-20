import WorkspaceToolbar from './index.svelte';
import type { RecipeWorkspaceToolbar } from '$stylist/workspace/interface/recipe/workspace-toolbar';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_SIZE } from '$stylist/design-token/const/array/size';
import { TOKEN_ORIENTATION } from '$stylist/layout/const/array/orientation';

/** Toolbar for graph scenes with zoom, layout and export actions. */
export default {
	component: WorkspaceToolbar,
	title: 'WorkspaceToolbar',
	description: 'Toolbar for graph scenes with zoom, layout and export actions.',
	args: {
		id: 'workspace-toolbar',
		items: [
			{ id: 'zoom-in', type: 'button', icon: 'plus', label: 'Zoom In', tooltip: 'Zoom in' },
			{ id: 'zoom-out', type: 'button', icon: 'minus', label: 'Zoom Out', tooltip: 'Zoom out' },
			{ id: 'fit', type: 'button', icon: 'maximize', label: 'Fit', tooltip: 'Fit to screen' },
			{ id: 'separator-1', type: 'separator' },
			{ id: 'layout', type: 'select', options: ['Dagre', 'Force', 'Grid'], value: 'Dagre' },
			{ id: 'separator-2', type: 'separator' },
			{ id: 'export', type: 'button', icon: 'download', label: 'Export', tooltip: 'Export graph' }
		],
		size: 'md',
		orientation: 'horizontal',
		compact: false,
		showTooltips: true
	},
	controls: {
		// The toolbar styles sm-lg.
		size: { type: 'select', options: TOKEN_SIZE.slice(1, 4) },
		orientation: { type: 'select', options: TOKEN_ORIENTATION },
		compact: { type: 'boolean' },
		showTooltips: { type: 'boolean' }
	},
	presets: {
		Vertical: { orientation: 'vertical' },
		Compact: { compact: true, size: 'sm' }
	}
} satisfies ContractStory<RecipeWorkspaceToolbar>;
