import Idef0Diagram from './index.svelte';
import type { RecipeIdef0Diagram } from '$stylist/idef-zero/interface/recipe/idef0-diagram';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** IDEF0 black-box diagram for inputs and outputs. */
export default {
	component: Idef0Diagram,
	title: 'IDEF0Diagram',
	description: 'IDEF0 black-box diagram for inputs and outputs.',
	args: {
		title: 'A0 Process Customer Order',
		subtitle: 'Black Box Function',
		inputs: [
			{ id: 'i1', label: 'Customer request' },
			{ id: 'i2', label: 'Order items' },
			{ id: 'i3', label: 'Payment data' }
		],
		outputs: [
			{ id: 'o1', label: 'Order confirmation' },
			{ id: 'o2', label: 'Invoice + receipt' },
			{ id: 'o3', label: 'Shipping task' }
		]
	},
	controls: {
		title: { type: 'text' },
		subtitle: { type: 'text' }
	}
} satisfies ContractStory<RecipeIdef0Diagram>;
