import Idef0BlackBox from './index.svelte';
import type { RecipeIdef0BlackBox } from '$stylist/idef-zero/interface/recipe/idef0-black-box';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Complete IDEF0 black box; index.story.svelte supplies the SVG parent. */
export default {
	component: Idef0BlackBox,
	title: 'IDEF0BlackBox',
	description: 'Complete IDEF0 black-box molecule.',
	args: {
		title: 'A0 Fulfill SlotOrder',
		subtitle: 'Black Box',
		inputs: [
			{ id: 'i1', label: 'SlotOrder' },
			{ id: 'i2', label: 'Customer data' },
			{ id: 'i3', label: 'Pricing rules' }
		],
		outputs: [
			{ id: 'o1', label: 'Shipment' },
			{ id: 'o2', label: 'Invoice' }
		],
		width: 920,
		height: 420
	},
	controls: {
		title: { type: 'text' },
		subtitle: { type: 'text' }
	}
} satisfies ContractStory<RecipeIdef0BlackBox>;
