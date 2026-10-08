<script lang="ts">
	import createPresenterNodeShellState from './state.svelte';
	import type { RecipePresenterNodeShell } from '$stylist/presentation/interface/recipe/presenter-node-shell';

	let props: RecipePresenterNodeShell = $props();
	const state = createPresenterNodeShellState(() => props);
</script>

<button
	type="button"
	class={state.hostClass}
	style={state.hostStyle}
	data-stage={state.presentation.stage}
	data-architecture={state.presentation.architecture}
	data-layer={state.presentation.layer}
	aria-pressed={props.selected ?? false}
	aria-label={`Focus ${props.node.title}`}
	onclick={state.select}
>
	{#if state.presentation.stage === 'dot'}
		<span class="presenter-node-shell__star" aria-hidden="true"></span>
	{:else}
		<div class="presenter-node-shell__body">
			{#if state.presentation.showIcon}
				<div class="presenter-node-shell__icon" aria-hidden="true">
					{props.node.iconText ?? props.node.title.slice(0, 1)}
				</div>
			{/if}

			{#if state.presentation.showLabel}
				<div class="presenter-node-shell__copy">
					<div class="presenter-node-shell__title">{props.node.label ?? props.node.title}</div>
					{#if state.showCard && props.node.description}
						<div class="presenter-node-shell__description">{props.node.description}</div>
					{/if}
				</div>
			{/if}

			{#if state.presentation.showChildren && props.node.children?.length}
				<div class="presenter-node-shell__meta">
					{props.node.children.length} linked
				</div>
			{/if}
		</div>
	{/if}
</button>

<style>
	.presenter-node-shell {
		position: absolute;
		display: block;
		padding: 0;
		background: color-mix(in srgb, var(--color-background-primary) 92%, white 8%);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--border-radius-lg);
		color: var(--color-text-primary);
		transform-origin: center center;
		transition:
			transform var(--prezi-animation-duration, 600ms) cubic-bezier(0.16, 1, 0.3, 1),
			width var(--prezi-animation-duration, 600ms) cubic-bezier(0.16, 1, 0.3, 1),
			min-height var(--prezi-animation-duration, 600ms) cubic-bezier(0.16, 1, 0.3, 1),
			box-shadow var(--duration-160) var(--animation-ease),
			background-color var(--duration-160) var(--animation-ease);
		cursor: pointer;
	}

	.presenter-node-shell:hover {
		background: color-mix(in srgb, var(--color-background-primary) 84%, white 16%);
	}

	.presenter-node-shell--stage-dot {
		width: 16px;
		min-height: 16px;
		border-radius: 999px;
		border-style: solid;
		background: transparent;
	}

	.presenter-node-shell__star {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 999px;
		background: currentColor;
		box-shadow: 0 0 18px color-mix(in srgb, currentColor 60%, transparent 40%);
	}

	.presenter-node-shell__body {
		display: flex;
		align-items: center;
		gap: var(--spacing-3);
		padding: var(--spacing-3);
		text-align: left;
	}

	.presenter-node-shell__icon {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 999px;
		background: color-mix(in srgb, currentColor 16%, transparent 84%);
		font-size: var(--font-size-3);
		font-weight: 700;
	}

	.presenter-node-shell__copy {
		min-width: 0;
	}

	.presenter-node-shell__title {
		font-size: var(--font-size-3);
		font-weight: 600;
		line-height: 1.2;
	}

	.presenter-node-shell__description {
		margin-top: var(--spacing-1);
		font-size: var(--font-size-2);
		color: var(--color-text-secondary);
	}

	.presenter-node-shell__meta {
		margin-left: auto;
		font-size: var(--font-size-1);
		color: var(--color-text-secondary);
		white-space: nowrap;
	}

	.presenter-node-shell--stage-icon,
	.presenter-node-shell--stage-minimal {
		border-radius: 999px;
	}

	.presenter-node-shell--stage-screen {
		max-width: min(32rem, 80vw);
	}
</style>
