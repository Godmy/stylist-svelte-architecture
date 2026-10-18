import Idef0Connector from './index.svelte';
import type { RecipeIdef0Connector } from '$stylist/idef-zero/interface/recipe/idef0-connector';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Input/output connection arrow; index.story.svelte supplies the SVG parent. */
export default {
	component: Idef0Connector,
	title: 'IDEF0Connector',
	description: 'Input/output connection arrow for IDEF0.',
	args: {
		label: 'Validated request',
		direction: 'input',
		x1: 20,
		y1: 60,
		x2: 220,
		y2: 60,
		showArrow: true
	},
	controls: {
		label: { type: 'text' },
		direction: { type: 'select', options: ['input', 'output'] },
		showArrow: { type: 'boolean' }
	},
	presets: {
		Output: { direction: 'output', x1: 200, x2: 400 }
	}
} satisfies ContractStory<RecipeIdef0Connector>;
