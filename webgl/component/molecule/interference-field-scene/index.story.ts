import InterferenceFieldScene from '$stylist/webgl/component/molecule/interference-field-scene/index.svelte';
import type { RecipeInterferenceFieldScene } from '$stylist/webgl/interface/recipe/interference-field-scene';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Animated interference field; index.story.svelte gives it a sized frame. */
export default {
	component: InterferenceFieldScene,
	title: 'InterferenceFieldScene',
	description: 'Pulsing ring shader with live speed and tint.',
	args: { speed: 1, color: '#80b7eb' },
	controls: {
		speed: { type: 'range', min: 0, max: 3, step: 0.1 },
		color: { type: 'color' }
	},
	presets: { Frozen: { speed: 0 }, Amber: { color: '#f59e0b', speed: 2 } }
} satisfies ContractStory<RecipeInterferenceFieldScene>;
