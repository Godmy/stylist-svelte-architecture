import Workspace from './index.svelte';
import type { RecipeWorkspace } from '$stylist/workspace/interface/recipe/workspace';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_PAN_MODES } from '$stylist/workspace/const/array/pan-mode';

/** Full graph workspace; index.story.svelte owns the graph state the workspace edits. */
export default {
	component: Workspace,
	title: 'Workspace',
	description:
		'Full graph workspace: canvas, toolbar, node palette and properties panel in one organism. Fully wired — drag a node, drag from an output port to an input port, add nodes from the palette.',
	args: {
		showToolbar: true,
		showMiniMap: true,
		showWorkspacePalette: true,
		showPropertiesPanel: true,
		showGrid: true,
		panMode: 'drag',
		allowAddNodes: true,
		allowDeleteNodes: true,
		allowDuplicateNodes: true
	},
	controls: {
		showToolbar: { type: 'boolean' },
		showMiniMap: { type: 'boolean' },
		showWorkspacePalette: { type: 'boolean' },
		showPropertiesPanel: { type: 'boolean' },
		showGrid: { type: 'boolean' },
		panMode: { type: 'select', options: TOKEN_PAN_MODES },
		allowDeleteNodes: { type: 'boolean' },
		allowDuplicateNodes: { type: 'boolean' }
	},
	presets: {
		'Canvas Only': {
			showToolbar: false,
			showMiniMap: false,
			showWorkspacePalette: false,
			showPropertiesPanel: false
		}
	}
} satisfies ContractStory<RecipeWorkspace>;
