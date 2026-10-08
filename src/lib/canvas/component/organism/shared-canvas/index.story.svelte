<script lang="ts">
	import type { AnyProperty } from '$stylist/layout/type/record/any-property';
	import type { SlotCanvasObject } from '$stylist/canvas/interface/slot/canvas-object';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';
	import Story from '$stylist/theme/component/molecule/story/index.svelte';

	import SharedCanvas from './index.svelte';

	const defaultObjects: SlotCanvasObject[] = [
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
	];

	const defaultUsers: AnyProperty[] = [
		{ id: 'user1', name: 'Alice', color: '#8b5cf6' },
		{ id: 'user2', name: 'Bob', color: '#ec4899' }
	];

	const controls: SlotStory[] = [
		{ name: 'width', type: 'select', options: [600, 700, 800, 900], defaultValue: 800 },
		{ name: 'height', type: 'select', options: [400, 500, 600, 700], defaultValue: 600 },
		{ name: 'showUsers', type: 'boolean', defaultValue: true },
		{ name: 'showToolbar', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	{controls}
	title="SharedCanvas"
	category="Organisms/Architecture/Canvas"
	description="Shared canvas component for collaborative drawing."
	tags={['canvas', 'collaboration', 'drawing', 'multi-user']}
>
	{#snippet children(values: any)}
		<SharedCanvas
			width={values.width as number}
			height={values.height as number}
			objects={defaultObjects}
			users={defaultUsers}
			currentUserId="user1"
			showUsers={values.showUsers as boolean}
			showToolbar={values.showToolbar as boolean}
		/>
	{/snippet}
</Story>
