import Idef0FunctionBox from './index.svelte';
import type { RecipeIdef0FunctionBox } from '$stylist/idef-zero/interface/recipe/idef0-function-box';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** IDEF0 function block; index.story.svelte supplies the SVG parent. */
export default {
	component: Idef0FunctionBox,
	title: 'IDEF0FunctionBox',
	description: 'IDEF0 function block atom.',
	args: {
		title: 'A0 Process SlotOrder',
		subtitle: 'Black Box Function',
		x: 50,
		y: 20,
		width: 320,
		height: 200
	},
	controls: {
		title: { type: 'text' },
		subtitle: { type: 'text' }
	}
} satisfies ContractStory<RecipeIdef0FunctionBox>;
