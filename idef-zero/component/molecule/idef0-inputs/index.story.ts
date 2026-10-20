import Idef0Inputs from './index.svelte';
import type { RecipeIdef0Io } from '$stylist/idef-zero/interface/recipe/idef0-io';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Input connectors; index.story.svelte supplies the SVG parent and the box outline. */
export default {
	component: Idef0Inputs,
	title: 'IDEF0Inputs',
	description: 'Input connectors for IDEF0 black-box.',
	args: {
		ports: [
			{ id: 'i1', label: 'SlotOrder request' },
			{ id: 'i2', label: 'Customer profile' },
			{ id: 'i3', label: 'Business rules' }
		],
		boxX: 180,
		boxY: 30,
		boxHeight: 200,
		startX: 20
	}
} satisfies ContractStory<RecipeIdef0Io>;
