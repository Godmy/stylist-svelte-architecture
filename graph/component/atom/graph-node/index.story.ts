import GraphNode from './index.svelte';
import type { RecipeGraphNode } from '$stylist/graph/interface/recipe/graph-node';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_SIZE } from '$stylist/design-token/const/array/size';

/** Graph nodes on a draggable canvas; index.story.svelte draws the canvas. */
export default {
	component: GraphNode,
	title: 'GraphNode',
	description: 'Interactive graph nodes with selection, drag-and-drop and live edge feedback.',
	args: {
		label: 'Primary',
		color: '#3b82f6',
		type: 'source',
		size: 'md',
		selected: true,
		snapToGrid: true,
		showEdges: true,
		directed: true
	},
	controls: {
		// label, color, type and selected apply to the primary node of the canvas.
		label: { type: 'text' },
		color: { type: 'color' },
		// The node styles distinguish these roles; no token array lists them.
		type: { type: 'select', options: ['source', 'gateway', 'target'] },
		size: { type: 'select', options: TOKEN_SIZE.slice(0, 6) },
		selected: { type: 'boolean' },
		// Story knobs: grid snapping while dragging and the edges between the nodes.
		snapToGrid: { type: 'boolean' },
		showEdges: { type: 'boolean' },
		directed: { type: 'boolean' }
	},
	presets: {
		Gateway: { label: 'Gateway', type: 'gateway', color: '#f59e0b', size: 'lg' },
		'Without edges': { showEdges: false, selected: false }
	}
} satisfies ContractStory<
	RecipeGraphNode & { snapToGrid?: boolean; showEdges?: boolean; directed?: boolean }
>;
