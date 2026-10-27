import Idef0Decomposition from '$stylist/idef-zero/component/organism/idef0-decomposition/index.svelte';
import type { RecipeIdef0Decomposition } from '$stylist/idef-zero/interface/recipe/idef0-decomposition';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** IDEF0 node diagram with inputs, controls, outputs and mechanisms on a staircase. */
export default {
	component: Idef0Decomposition,
	title: 'IDEF0Decomposition',
	description: 'IDEF0 node diagram: activities on a staircase with ICOM arrows between them.',
	args: {
		title: 'A0 Process Customer Order',
		arrows: [
			{ id: 'request', label: 'Customer request' },
			{ id: 'policy', label: 'Sales policy' },
			{ id: 'order', label: 'Accepted order' },
			{ id: 'stock', label: 'Stock levels' },
			{ id: 'shipment', label: 'Shipment' },
			{ id: 'staff', label: 'Sales team' },
			{ id: 'warehouse', label: 'Warehouse' }
		],
		activities: [
			{
				id: 'A1',
				title: 'Accept order',
				inputs: ['request'],
				controls: ['policy'],
				outputs: ['order'],
				mechanisms: ['staff']
			},
			{
				id: 'A2',
				title: 'Ship goods',
				inputs: ['order', 'stock'],
				outputs: ['shipment'],
				mechanisms: ['warehouse']
			}
		]
	},
	controls: {
		title: { type: 'text' }
	}
} satisfies ContractStory<RecipeIdef0Decomposition>;
