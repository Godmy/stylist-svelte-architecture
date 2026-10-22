import Idef0PortLabel from '$stylist/idef-zero/component/atom/idef0-port-label/index.svelte';
import type { RecipeIdef0PortLabel } from '$stylist/idef-zero/interface/recipe/idef0-port-label';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Port label; index.story.svelte supplies the SVG parent. */
export default {
	component: Idef0PortLabel,
	title: 'IDEF0PortLabel',
	description: 'Label for IDEF0 ports.',
	args: { text: 'Customer request', x: 160, y: 40, anchor: 'start' },
	controls: {
		text: { type: 'text' },
		anchor: { type: 'select', options: ['start', 'middle', 'end'] }
	}
} satisfies ContractStory<RecipeIdef0PortLabel>;
