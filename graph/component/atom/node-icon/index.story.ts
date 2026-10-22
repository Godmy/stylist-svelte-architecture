import NodeIcon from '$stylist/graph/component/atom/node-icon/index.svelte';
import type { RecipeNodeIcon } from '$stylist/graph/interface/recipe/node-icon';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Colored monogram badge for graph node categories. */
export default {
	component: NodeIcon,
	title: 'NodeIcon',
	description: 'Colored monogram badge for graph node categories (sizes 32, 40, 48, 56px).',
	args: { icon: 'NS', size: 32, accent: '#3498db', background: '#ffffff' },
	controls: {
		icon: { type: 'text' },
		size: { type: 'range', min: 16, max: 96, step: 4 },
		accent: { type: 'color' },
		background: { type: 'color' }
	},
	presets: {
		Signal: { icon: 'SG', size: 40, accent: '#e74c3c' },
		Insight: { icon: 'IN', size: 48, accent: '#2ecc71' },
		Delivery: { icon: 'DL', size: 56, accent: '#f39c12' }
	},
	context: {
		kind: 'element',
		tag: 'div',
		attrs: { style: 'display: flex; padding: 2.5rem; background: #f5f5f5;' },
		children: [{ kind: 'outlet' }]
	}
} satisfies ContractStory<RecipeNodeIcon>;
