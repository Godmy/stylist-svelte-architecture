import ColorPalette from './index.svelte';
import type { RecipeColorPalette } from '$stylist/canvas/interface/recipe/color-palette';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Color picker with a hex input and a palette panel. */
export default {
	component: ColorPalette,
	title: 'Color Palette',
	description: 'An advanced color picker component.',
	args: { value: '#22b14c', disabled: false, showInput: true, showPalette: true },
	controls: {
		value: { type: 'text' },
		disabled: { type: 'boolean' },
		showInput: { type: 'boolean' },
		showPalette: { type: 'boolean' }
	},
	presets: { Disabled: { disabled: true }, 'Palette only': { showInput: false } }
} satisfies ContractStory<RecipeColorPalette>;
