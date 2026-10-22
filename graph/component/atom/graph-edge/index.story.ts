import GraphEdge from '$stylist/graph/component/atom/graph-edge/index.svelte';
import type { RecipeGraphEdge } from '$stylist/graph/interface/recipe/graph-edge';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import type { TokenSize } from '$stylist/design-token/type/alias/size';
import { TOKEN_SIZE } from '$stylist/design-token/const/array/size';
import { TOKEN_TRAJECTORY } from '$stylist/workspace/const/array/trajectory';

/** Graph edges between draggable nodes; index.story.svelte draws the canvas. */
export default {
	component: GraphEdge,
	title: 'GraphEdge',
	description:
		'Interactive graph edges between draggable nodes. Use the controls to compare straight, curved and polyline routing.',
	args: {
		type: 'straight',
		directed: true,
		active: false,
		nodeSize: 'md',
		edgeColor: '#2563eb',
		edgeThickness: 3,
		showLabels: true,
		snapToGrid: true
	},
	controls: {
		// The canvas distinguishes the straight, curve and polyline routes.
		type: { type: 'select', options: TOKEN_TRAJECTORY.slice(0, 3) },
		directed: { type: 'boolean' },
		active: { type: 'boolean' },
		// Story knobs: node size, edge colour/thickness, labels and grid snapping of the canvas.
		nodeSize: { type: 'select', options: TOKEN_SIZE.slice(0, 6) },
		edgeColor: { type: 'color' },
		edgeThickness: { type: 'range', min: 1, max: 8, step: 1 },
		showLabels: { type: 'boolean' },
		snapToGrid: { type: 'boolean' }
	},
	presets: {
		Curve: { type: 'curve', active: true },
		Polyline: { type: 'polyline', directed: false, edgeColor: '#0f766e' }
	}
} satisfies ContractStory<
	RecipeGraphEdge & {
		nodeSize?: TokenSize;
		edgeColor?: string;
		edgeThickness?: number;
		showLabels?: boolean;
		snapToGrid?: boolean;
	}
>;
