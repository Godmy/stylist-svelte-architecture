import GraphvizDirectedEdge from '$stylist/graph/component/molecule/graphviz-directed-edge/index.svelte';
import type { RecipeGraphvizDirectedEdge } from '$stylist/graph/interface/recipe/graphviz-directed-edge';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Directed SVG edge with an arrowhead and an optional label. */
export default {
	component: GraphvizDirectedEdge,
	title: 'Graphviz Directed Edge',
	description: 'Directed SVG edge between two points with an arrowhead and an optional label.',
	args: {
		id: 'edge-a',
		sourceX: 40,
		sourceY: 40,
		targetX: 190,
		targetY: 130,
		text: 'Edge',
		style: 'dashed',
		color: '#2563eb',
		width: 2
	},
	controls: {
		sourceX: { type: 'range', min: 0, max: 400, step: 5 },
		sourceY: { type: 'range', min: 0, max: 200, step: 5 },
		targetX: { type: 'range', min: 0, max: 400, step: 5 },
		targetY: { type: 'range', min: 0, max: 200, step: 5 },
		text: { type: 'text' },
		style: { type: 'select', options: ['solid', 'dashed', 'dotted'] },
		color: { type: 'color' },
		width: { type: 'range', min: 1, max: 8, step: 1 }
	},
	presets: { Solid: { style: 'solid' }, Dotted: { style: 'dotted', color: '#0f766e' } },
	// The edge SVG fills its positioned parent.
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'position: relative; height: 220px; padding: 1rem; border: 1px solid var(--color-border-primary); border-radius: 0.25rem;'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeGraphvizDirectedEdge>;
