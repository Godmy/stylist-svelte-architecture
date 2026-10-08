<script lang="ts">
	import type { RecipeColorPalette } from '$stylist/canvas/interface/recipe/color-palette';
	import createColorPaletteState from './state.svelte';

	let props: RecipeColorPalette = $props();
	const state = createColorPaletteState(() => props);
</script>

<div class={state.rootClass} {...state.restProps}>
	<button
		type="button"
		class={state.triggerClass}
		onclick={state.toggleOpen}
		disabled={props.disabled ?? false}
	>
		<div class={state.previewClass} style={`background-color: ${state.internalValue}`}></div>
		{#if props.showInput ?? true}
			<input
				type="text"
				bind:value={state.internalValue}
				class={state.textInputClass}
				onblur={() => state.setColor(state.internalValue)}
			/>
		{/if}
	</button>

	{#if state.isOpen && !(props.disabled ?? false)}
		<div class={state.panelClass}>
			{#if props.showPalette ?? true}
				<div class={state.paletteClass}>
					{#each state.palette as color}
						<button
							type="button"
							aria-label={`Select color ${color}`}
							class={state.paletteButtonClass}
							style={`background-color: ${color}`}
							onclick={() => state.setColor(color)}
						></button>
					{/each}
				</div>
			{/if}
			<input
				type="color"
				bind:value={state.internalValue}
				oninput={state.handleInput}
				onchange={state.handleChange}
			/>
			<button type="button" class={state.acceptButtonClass} onclick={() => state.setOpen(false)}>
				OK
			</button>
		</div>
	{/if}
</div>

<style>
	.c-color-picker {
		position: relative;
		display: inline-block;
	}

	.c-color-picker__trigger {
		display: flex;
		align-items: center;
		min-width: 8.75rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border-primary);
		border-radius: 0.375rem;
		background: var(--color-background-primary);
		cursor: pointer;
	}

	.c-color-picker__trigger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.c-color-picker__panel {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: var(--color-background-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: 0.5rem;
		box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
		z-index: var(--z-index-popover, 1500);
	}

	.c-color-picker__preview {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		border: 1px solid var(--color-border-secondary);
		margin-right: 0.5rem;
		flex-shrink: 0;
	}

	.c-color-picker__text-input {
		outline: none;
		background: transparent;
		width: 6rem;
		border: none;
	}

	.c-color-picker__palette {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.c-color-picker__palette-btn {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		border: 1px solid var(--color-border-secondary);
		cursor: pointer;
		padding: 0;
	}

	.c-color-picker__accept-btn {
		margin-left: 0.5rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--color-border-primary);
		border-radius: 0.25rem;
		cursor: pointer;
		background: var(--color-background-primary);
	}
</style>
