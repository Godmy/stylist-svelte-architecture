import ZwickyScene from './index.svelte';
import type { RecipeZwickyScene } from '$stylist/graph/interface/recipe/zwicky-scene';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Morphological box of the library dependencies; index.story.svelte loads the graph data. */
export default {
	component: ZwickyScene,
	title: 'ZwickyScene',
	description:
		'Morphological box (Zwicky) of the library: every domain/cluster/joint/family as an instanced WebGL node with its dependencies, domain legend and assembly-layer filter.',
	args: { title: 'Morphological Box - Zwicky' },
	controls: { title: { type: 'text' } },
	layout: 'fullscreen'
} satisfies ContractStory<RecipeZwickyScene>;
