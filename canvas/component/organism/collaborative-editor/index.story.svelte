<script lang="ts">
	import Story from '$stylist/theme/component/molecule/story/index.svelte';
	import type { SlotStory } from '$stylist/theme/interface/slot/story';

	import CollaborativeEditor from './index.svelte';

	let content: string = `<h2>Collaborative Document</h2><p>This is a collaborative editor component. Multiple users can edit this document simultaneously.</p><p>Try using the formatting tools above to modify the content.</p>`;

	let users = [
		{ id: '1', name: 'Alice Johnson', color: '#3b82f6' }, // blue
		{ id: '2', name: 'Bob Smith', color: '#ef4444' }, // red
		{ id: '3', name: 'Carol Davis', color: '#10b981' } // green
	];

	let currentUser = { id: '4', name: 'You', color: '#8b5cf6' }; // purple
	let showToolbar: boolean = true;
	let showUserList: boolean = true;

	type Props = {
		showToolbar: boolean;
		showUserList: boolean;
	};

	const controls: SlotStory[] = [
		{ name: 'showToolbar', type: 'boolean', defaultValue: true },
		{ name: 'showUserList', type: 'boolean', defaultValue: true }
	];
</script>

<Story
	id="organisms-collaborative-editor"
	title="Organisms / Canvas / Collaborate / CollaborativeEditor"
	component={CollaborativeEditor}
	category="Organisms/Canvas/Collaborate"
	description="Real-time collaborative editor with formatting tools and user presence indicators."
	{controls}
>
	{#snippet children(values: any)}
		<div class="sb-organisms-collaborative-editor _c1">
			<h1 class="_c2">CollaborativeEditor Component</h1>

			<div class="_c3">
				<h2 class="_c4">Interactive CollaborativeEditor</h2>
				<div class="_c5">
					<CollaborativeEditor
						{content}
						{users}
						{currentUser}
						showToolbar={values.showToolbar}
						showUserList={values.showUserList}
					/>
				</div>

				<div class="_c6">
					<div class="_c7">
						<label for="show-toolbar" class="_c8">
							<input id="show-toolbar" type="checkbox" bind:checked={showToolbar} />
							Show Toolbar
						</label>
					</div>

					<div class="_c7">
						<label for="show-user-list" class="_c8">
							<input id="show-user-list" type="checkbox" bind:checked={showUserList} />
							Show User List
						</label>
					</div>
				</div>
			</div>

			<div class="_c9">
				<h2 class="_c4">CollaborativeEditor Variations</h2>
				<div class="_c10">
					<div>
						<h3 class="_c11">Editor without User List</h3>
						<div class="_c12">
							<CollaborativeEditor
								content="<h3>Simple Editor</h3><p>This editor has no user list displayed. It focuses only on the content editing area.</p>"
								{users}
								{currentUser}
								showToolbar={true}
								showUserList={false}
							/>
						</div>
					</div>
					<div>
						<h3 class="_c11">Editor without Toolbar</h3>
						<div class="_c12">
							<CollaborativeEditor
								content="<p>Content in read-only mode (no editing tools). This could be used for displaying collaborative content without allowing editing.</p>"
								{users}
								{currentUser}
								showToolbar={false}
								showUserList={true}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<style>
	._c1 {
		padding: 1rem;
	}
	._c10 > * + * {
		margin-top: 1rem;
	}
	._c11 {
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-weight: 500;
	}
	._c12 {
		height: 300px;
	}
	._c2 {
		margin-bottom: 1rem;
		font-size: 1.125rem;
		line-height: 1.75rem;
		font-weight: 600;
	}
	._c3 {
		margin-bottom: 1.5rem;
		border-radius: 0.25rem;
		border-width: 1px;
		border-style: solid;
		padding: 1rem;
	}
	._c4 {
		font-size: 1rem;
		line-height: 1.5rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}
	._c5 {
		height: 400px;
	}
	._c6 {
		margin-top: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	._c7 {
		display: flex;
		align-items: flex-end;
	}
	._c8 {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	._c9 {
		border-radius: 0.25rem;
		border-width: 1px;
		border-style: solid;
		padding: 1rem;
	}
</style>
