import Idef0Outputs from '$stylist/idef-zero/component/molecule/idef0-outputs/index.svelte';
import type { RecipeIdef0Io } from '$stylist/idef-zero/interface/recipe/idef0-io';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Output connectors; index.story.svelte supplies the SVG parent and the box outline. */
export default {
	component: Idef0Outputs,
	title: 'IDEF0Outputs',
	description: 'Output connectors for IDEF0 black-box.',
	args: {
		ports: [
			{ id: 'o1', label: 'Approved order' },
			{ id: 'o2', label: 'Rejection reason' }
		],
		boxX: 40,
		boxWidth: 220,
		boxY: 30,
		boxHeight: 200,
		endX: 500
	}
} satisfies ContractStory<RecipeIdef0Io>;
