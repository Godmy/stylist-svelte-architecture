import SharedCanvas from './index.svelte';
import type { RecipeSharedCanvas } from '$stylist/canvas/interface/recipe/shared-canvas';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Shared canvas for collaborative drawing. */
export default {
	component: SharedCanvas,
	title: 'SharedCanvas',
	description: 'Shared canvas component for collaborative drawing.',
	args: {
		width: 800,
		height: 600,
		objects: [
			{
				id: 'path1',
				type: 'path',
				points: [
					{ x: 20, y: 20 },
					{ x: 80, y: 80 },
					{ x: 20, y: 80 }
				]
			},
			{ id: 'text1', type: 'text', x: 100, y: 200, text: 'Shared Canvas', color: '#10b981' }
		],
		users: [
			{ id: 'user1', name: 'Alice', color: '#8b5cf6' },
			{ id: 'user2', name: 'Bob', color: '#ec4899' }
		],
		currentUserId: 'user1',
		showUsers: true,
		showToolbar: true
	},
	controls: {
		width: { type: 'select', options: [600, 700, 800, 900] },
		height: { type: 'select', options: [400, 500, 600, 700] },
		showUsers: { type: 'boolean' },
		showToolbar: { type: 'boolean' }
	}
} satisfies ContractStory<RecipeSharedCanvas>;
