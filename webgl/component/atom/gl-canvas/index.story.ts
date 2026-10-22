import GlCanvas from '$stylist/webgl/component/atom/gl-canvas/index.svelte';
import type { RecipeGlCanvas } from '$stylist/webgl/interface/recipe/gl-canvas';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Base WebGL2 canvas; index.story.svelte passes the frame hook that clears with a pulsing color. */
export default {
	component: GlCanvas,
	title: 'GlCanvas',
	description: 'Base WebGL2 canvas with init, frame, and resize hooks.'
} satisfies ContractStory<RecipeGlCanvas>;
