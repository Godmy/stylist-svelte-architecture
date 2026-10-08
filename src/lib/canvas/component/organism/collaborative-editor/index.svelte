<script lang="ts">
	import BaseIcon from '$stylist/svg/component/atom/icon/index.svelte';
	import createCollaborativeEditorState from './state.svelte';
	import type { RecipeCollaborativeEditor } from '$stylist/canvas/interface/recipe/collaborative-editor';

	let props: RecipeCollaborativeEditor = $props();

	const state = createCollaborativeEditorState(() => props);

	let editorRef: HTMLDivElement | undefined;

	$effect(() => {
		state.editorRef = editorRef;
	});
</script>

<div class={state.containerClasses} {...props}>
	{#if state.showToolbar}
		<div class={state.toolbarClasses}>
			<button
				type="button"
				class={state.toolbarButtonClasses}
				onclick={() => state.formatText('bold')}
				title="Bold"
			>
				<BaseIcon name={state.Bold} class="_c1" />
			</button>
			<button
				type="button"
				class={state.toolbarButtonClasses}
				onclick={() => state.formatText('italic')}
				title="Italic"
			>
				<BaseIcon name={state.Italic} class="_c1" />
			</button>
			<button
				type="button"
				class={state.toolbarButtonClasses}
				onclick={() => state.formatText('underline')}
				title="Underline"
			>
				<BaseIcon name={state.Underline} class="_c1" />
			</button>
			<div class={state.toolbarSeparatorClasses}></div>
			<button
				type="button"
				class={state.toolbarButtonClasses}
				onclick={() => state.formatText('justifyLeft')}
				title="Align Left"
			>
				<BaseIcon name={state.AlignLeft} class="_c1" />
			</button>
			<button
				type="button"
				class={state.toolbarButtonClasses}
				onclick={() => state.formatText('justifyCenter')}
				title="Align Center"
			>
				<BaseIcon name={state.AlignCenter} class="_c1" />
			</button>
			<button
				type="button"
				class={state.toolbarButtonClasses}
				onclick={() => state.formatText('justifyRight')}
				title="Align Right"
			>
				<BaseIcon name={state.AlignRight} class="_c1" />
			</button>
			<div class={state.toolbarSeparatorClasses}></div>
			<button
				type="button"
				class={state.toolbarButtonClasses}
				onclick={() => state.formatText('insertUnorderedList')}
				title="Bullet List"
			>
				<BaseIcon name={state.List} class="_c1" />
			</button>
			<button
				type="button"
				class={state.toolbarButtonClasses}
				onclick={() => state.formatText('insertOrderedList')}
				title="Numbered List"
			>
				<BaseIcon name={state.ListOrdered} class="_c1" />
			</button>
			<div class={state.toolbarSeparatorClasses}></div>
			<button
				type="button"
				class={state.toolbarButtonClasses}
				onclick={state.insertComment}
				title="Insert Comment"
			>
				<BaseIcon name={state.MessageCircle} class="_c1" />
			</button>
		</div>
	{/if}

	<div class="c-collaborative-editor__body">
		<div class="c-collaborative-editor__editor-col">
			<div
				bind:this={editorRef}
				contenteditable="true"
				class={state.editorClasses}
				oninput={() => state.handleEditorInput()}
				onblur={state.handleBlur}
			>
				{@html state.editorContent}
			</div>
		</div>

		{#if state.showUserList && state.users.length > 0}
			<div class={state.userListClasses}>
				<div class={state.userListHeaderClasses}>
					<BaseIcon name={state.Users} class="_c2" />
					Collaborators ({state.users.length})
				</div>
				<div class="c-collaborative-editor__user-entries">
					{#each state.users as user}
						<div class={state.userListEntryClasses}>
							{#if user.avatar}
								<img
									src={user.avatar}
									alt={user.name}
									class={state.userAvatarClasses}
									style={`border: 2px solid ${user.color}`}
								/>
							{:else}
								<div class={state.userInitialsClasses} style={`background-color: ${user.color}`}>
									{user.name.charAt(0).toUpperCase()}
								</div>
							{/if}
							<span class={state.userNameClasses}>{user.name}</span>
							{#if state.currentUser?.id === user.id}
								<span class={state.userIndicatorClasses}>(You)</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.c-collaborative-editor {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: 1.5rem;
		border: 1px solid var(--color-border-primary);
		background: var(--color-background-primary);
		box-shadow: var(--shadow-custom40, 0 8px 32px rgb(0 0 0 / 0.1));
	}

	.c-collaborative-editor__toolbar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		border-bottom: 1px solid var(--color-border-primary);
		background: var(--color-background-secondary);
		padding: 0.5rem 0.75rem;
	}

	.c-collaborative-editor__toolbar-btn {
		display: inline-flex;
		width: 2.25rem;
		height: 2.25rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 1px solid transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		background: none;
		transition:
			background var(--duration-120, 120ms) ease,
			border-color var(--duration-120, 120ms) ease;
	}

	.c-collaborative-editor__toolbar-btn:hover {
		border-color: var(--color-border-primary);
		background: var(--color-background-primary);
		color: var(--color-text-primary);
	}

	.c-collaborative-editor__toolbar-sep {
		width: 1px;
		height: 1.5rem;
		background: var(--color-border-primary);
		margin-inline: 0.25rem;
	}

	.c-collaborative-editor__body {
		display: flex;
		flex: 1;
	}

	.c-collaborative-editor__editor-col {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.c-collaborative-editor__editor {
		flex: 1;
		min-height: 20rem;
		overflow: auto;
		background: var(--color-background-primary);
		padding: 1rem 1.25rem;
		color: var(--color-text-primary);
		line-height: 1.75;
	}

	.c-collaborative-editor__editor:focus {
		outline: none;
	}

	.c-collaborative-editor__user-list {
		width: 14rem;
		border-left: 1px solid var(--color-border-primary);
		background: var(--color-background-secondary);
		padding: 1rem;
	}

	.c-collaborative-editor__user-list-header {
		display: flex;
		align-items: center;
		margin-bottom: 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-secondary);
	}

	.c-collaborative-editor__user-entries {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.c-collaborative-editor__user-entry {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: 0.9rem;
		padding: 0.5rem;
		color: var(--color-text-primary);
	}

	.c-collaborative-editor__user-avatar {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 9999px;
		box-shadow: 0 0 0 2px var(--color-background-primary);
	}

	.c-collaborative-editor__user-initials {
		display: flex;
		width: 1.75rem;
		height: 1.75rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-inverse);
		box-shadow: 0 0 0 2px var(--color-background-primary);
	}

	.c-collaborative-editor__user-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.c-collaborative-editor__user-indicator {
		margin-left: 0.25rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	._c1 {
		height: 1rem;
		width: 1rem;
	}
	._c2 {
		margin-right: 0.25rem;
		height: 1rem;
		width: 1rem;
	}
</style>
