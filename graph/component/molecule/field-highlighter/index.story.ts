import FieldHighlighter from '$stylist/graph/component/molecule/field-highlighter/index.svelte';
import type { RecipeFieldHighlighter } from '$stylist/graph/interface/recipe/field-highlighter';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Highlights the selected node, the nodes mentioning the selected field and their edges. */
export default {
	component: FieldHighlighter,
	title: 'FieldHighlighter',
	description:
		'Interactive field highlighter with graph visualization: the selected node, nodes whose label mentions the selected field and the edges of the selected node are highlighted.',
	args: {
		data: {
			nodes: [
				{ id: 'customer', x: 40, y: 120, label: 'Customer: id, email, first_name' },
				{ id: 'order', x: 300, y: 220, label: 'Order: order_id, customer_id, total' },
				{ id: 'engagement', x: 560, y: 140, label: 'Engagement: session_id, customer_id, event' }
			],
			edges: [
				{ id: 'customer-order', fromNodeId: 'customer', toNodeId: 'order', label: '1 -> n' },
				{
					id: 'customer-engagement',
					fromNodeId: 'customer',
					toNodeId: 'engagement',
					label: '1 -> n'
				}
			]
		},
		selectedNode: { id: 'customer', x: 40, y: 120, label: 'Customer: id, email, first_name' },
		selectedField: { name: 'email' }
	},
	presets: {
		'Shared field customer_id': {
			selectedNode: { id: 'order', x: 300, y: 220, label: 'Order: order_id, customer_id, total' },
			selectedField: { name: 'customer_id' }
		},
		'Nothing selected': { selectedNode: null, selectedField: null }
	},
	// Nodes are absolutely positioned inside the canvas.
	context: {
		kind: 'element',
		tag: 'div',
		attrs: {
			style:
				'position: relative; min-height: 360px; overflow: hidden; padding: 1rem; border: 1px dashed var(--color-border-primary); border-radius: 1rem; background-color: var(--color-background-secondary);'
		},
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeFieldHighlighter>;
