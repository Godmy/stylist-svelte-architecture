import NodeHeader from '$stylist/workspace/component/atom/node-header/index.svelte';
import type { RecipeNodeHeader } from '$stylist/workspace/interface/recipe/node-header';
import type { ContractStory } from '$stylist/html/interface/contract/story';
import { TOKEN_SIZE } from '$stylist/design-token/const/array/size';

/** Header for node components with title, actions, and edit functionality. */
export default {
	component: NodeHeader,
	title: 'NodeHeader',
	description: 'Header for node components with title, actions, and edit functionality.',
	args: {
		id: 'node-header-1',
		title: 'Data Processor',
		color: '#3b82f6',
		size: 'md',
		selected: false,
		editable: true,
		showClose: true,
		showDuplicate: true,
		showSettings: true
	},
	controls: {
		color: { type: 'color' },
		// The header styles xs-lg.
		size: { type: 'select', options: TOKEN_SIZE.slice(0, 4) },
		selected: { type: 'boolean' },
		editable: { type: 'boolean' },
		showClose: { type: 'boolean' },
		showDuplicate: { type: 'boolean' },
		showSettings: { type: 'boolean' }
	}
} satisfies ContractStory<RecipeNodeHeader>;
