import CollaborativeEditor from '$stylist/canvas/component/organism/collaborative-editor/index.svelte';
import type { RecipeCollaborativeEditor } from '$stylist/canvas/interface/recipe/collaborative-editor';
import type { ContractStory } from '$stylist/html/interface/contract/story';

/** Real-time collaborative editor. */
export default {
	component: CollaborativeEditor,
	title: 'CollaborativeEditor',
	description: 'Real-time collaborative editor with formatting tools and user presence indicators.',
	args: {
		content:
			'<h2>Collaborative Document</h2><p>This is a collaborative editor component. Multiple users can edit this document simultaneously.</p><p>Try using the formatting tools above to modify the content.</p>',
		users: [
			{ id: '1', name: 'Alice Johnson', color: '#3b82f6' },
			{ id: '2', name: 'Bob Smith', color: '#ef4444' },
			{ id: '3', name: 'Carol Davis', color: '#10b981' }
		],
		currentUser: { id: '4', name: 'You', color: '#8b5cf6' },
		showToolbar: true,
		showUserList: true
	},
	controls: {
		showToolbar: { type: 'boolean' },
		showUserList: { type: 'boolean' }
	},
	presets: {
		'Without user list': {
			content:
				'<h3>Simple Editor</h3><p>This editor has no user list displayed. It focuses only on the content editing area.</p>',
			showUserList: false
		},
		'Without toolbar': {
			content:
				'<p>Content in read-only mode (no editing tools). This could be used for displaying collaborative content without allowing editing.</p>',
			showToolbar: false
		}
	}
} satisfies ContractStory<RecipeCollaborativeEditor>;
