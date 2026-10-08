<script lang="ts">
	import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';
	import Icon from '$stylist/svg/component/atom/icon/index.svelte';

	type Props = {
		node: SceneNode;
		onclose?: () => void;
	};

	let { node, onclose }: Props = $props();
</script>

<aside class="scene-inspector">
	<div class="scene-inspector__header">
		<h3 class="scene-inspector__title">{node.title}</h3>
		{#if onclose}
			<button
				type="button"
				class="scene-inspector__close"
				onclick={onclose}
				aria-label="Close inspector"
			>
				<Icon name="x" />
			</button>
		{/if}
	</div>

	<div class="scene-inspector__body">
		{#if node.label}
			<div class="scene-inspector__field">
				<span class="scene-inspector__key">Label</span>
				<span class="scene-inspector__value">{node.label}</span>
			</div>
		{/if}

		{#if node.description}
			<div class="scene-inspector__field">
				<span class="scene-inspector__key">Description</span>
				<p class="scene-inspector__value scene-inspector__value--text">{node.description}</p>
			</div>
		{/if}

		<div class="scene-inspector__field">
			<span class="scene-inspector__key">Depth</span>
			<span class="scene-inspector__value">{node.depth}</span>
		</div>

		<div class="scene-inspector__field">
			<span class="scene-inspector__key">Accent</span>
			<span class="scene-inspector__swatch" style="background: {node.accent};" aria-hidden="true"
			></span>
		</div>

		{#if node.children?.length}
			<div class="scene-inspector__field">
				<span class="scene-inspector__key">Children</span>
				<span class="scene-inspector__value">{node.children.length}</span>
			</div>
		{/if}
	</div>
</aside>

<style>
	.scene-inspector {
		display: flex;
		flex-direction: column;
		width: 260px;
		background: var(--color-background-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--border-radius-lg, 0.5rem);
		box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
		overflow: hidden;
	}

	.scene-inspector__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border-primary);
		background: var(--color-background-secondary);
		flex-shrink: 0;
	}

	.scene-inspector__title {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.scene-inspector__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		border-radius: var(--border-radius-sm, 0.25rem);
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.scene-inspector__close:hover {
		background: var(--color-background-hover);
		color: var(--color-text-primary);
	}

	.scene-inspector__body {
		padding: 0.875rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		overflow-y: auto;
	}

	.scene-inspector__field {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.scene-inspector__key {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-tertiary);
	}

	.scene-inspector__value {
		font-size: 0.875rem;
		color: var(--color-text-primary);
	}

	.scene-inspector__value--text {
		margin: 0;
		line-height: 1.5;
		color: var(--color-text-secondary);
	}

	.scene-inspector__swatch {
		display: inline-block;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: var(--border-radius-sm, 0.25rem);
		border: 1px solid var(--color-border-primary);
	}
</style>
