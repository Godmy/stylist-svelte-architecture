import ScreenshotSelector from './index.svelte';
import type { RecipeScreenshotSelector } from '$stylist/canvas/interface/recipe/screenshot-selector';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Overlay for selecting screenshot regions. */
export default {
	component: ScreenshotSelector,
	title: 'Screenshot Selector',
	description:
		'Canvas-domain overlay for selecting screenshot regions and optionally drawing annotations.',
	args: { drawingMode: false, drawColor: '#ef4444' },
	controls: { drawingMode: { type: 'boolean' }, drawColor: { type: 'color' } },
	presets: { Drawing: { drawingMode: true } },
	layout: 'fullscreen'
} satisfies ContractStory<RecipeScreenshotSelector>;
