import WorkspaceCanvas from './index.svelte';
import type { RecipeWorkspaceCanvas } from '$stylist/workspace/interface/recipe/workspace-canvas';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_PAN_MODES } from '$stylist/workspace/const/array/pan-mode';

/** Viewport shell for graph content; index.story.svelte places nodes on it. */
export default {
	component: WorkspaceCanvas,
	title: 'Workspace Canvas',
	description:
		'Viewport shell for graph content. Use it to inspect grid modes, pan behavior and zoom while keeping node placement readable.',
	args: {
		gridMode: 'dot',
		panMode: 'drag',
		zoom: 1,
		gridSize: 20,
		snapToGrid: false,
		width: 720,
		height: 320,
		backgroundColor: '#1e1e1e',
		gridColor: 'rgba(128, 128, 128, 0.2)'
	},
	controls: {
		// The canvas grid modes have no shared token.
		gridMode: { type: 'select', options: ['dot', 'number', 'letter', 'check', 'x'] },
		panMode: { type: 'select', options: TOKEN_PAN_MODES },
		zoom: { type: 'number' },
		gridSize: { type: 'number' },
		snapToGrid: { type: 'boolean' },
		width: { type: 'number' },
		height: { type: 'number' }
	},
	presets: {
		'Number Grid': { gridMode: 'number', panMode: 'space' },
		'Letter Grid': { gridMode: 'letter', panMode: 'always' },
		'Check Grid': { gridMode: 'check', zoom: 1.25 }
	}
} satisfies ContractStory<RecipeWorkspaceCanvas>;
