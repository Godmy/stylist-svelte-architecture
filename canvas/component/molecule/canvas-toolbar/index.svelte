<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SlotCanvasToolbarDrawingOptions } from '$stylist/canvas/interface/slot/canvas-toolbar-drawing-options';
	import type { CanvasToolbarDrawingTool } from '$stylist/canvas/type/alias/canvas-toolbar-drawing-tool';
	import type { RecipeCanvasToolbar } from '$stylist/canvas/interface/recipe/canvas-toolbar';
	import createCanvasToolbarState from './state.svelte';

	let dispatch = createEventDispatcher<{
		'tool-change': { tool: CanvasToolbarDrawingTool; options: SlotCanvasToolbarDrawingOptions };
		'clear-canvas': undefined;
		undo: undefined;
		redo: undefined;
		save: undefined;
	}>();

	let props: RecipeCanvasToolbar = $props();
	const state = createCanvasToolbarState(() => props, (type, detail) =>
		dispatch(type as never, detail as never)
	);

	export const clearCanvas = () => state.clearCanvas();
	export const undo = () => state.undo();
	export const redo = () => state.redo();
	export const save = () => state.save();
</script>

<div class="canvas-toolbar">
	<div class="tool-selector">
		<button
			class="tool-btn {state.currentTool === 'pen' ? 'active' : ''}"
			onclick={() => state.selectTool('pen')}
			type="button"
		>
			Pen
		</button>
		<button
			class="tool-btn {state.currentTool === 'eraser' ? 'active' : ''}"
			onclick={() => state.selectTool('eraser')}
			type="button"
		>
			Eraser
		</button>
	</div>

	<div class="tool-specific-options">
		<div class="option-group">
			<label for="line-width" class="option-label">Line width:</label>
			<input
				id="line-width"
				type="range"
				min="1"
				max="20"
				bind:value={state.currentOptions.lineWidth}
				oninput={() => state.handleOptionsUpdate(state.currentOptions)}
				class="option-input"
			/>
			<span class="option-value">{state.currentOptions.lineWidth}px</span>
		</div>

		<div class="option-group">
			<label for="color-picker" class="option-label">Color:</label>
			<input
				id="color-picker"
				type="color"
				bind:value={state.currentOptions.strokeColor}
				oninput={() => state.handleOptionsUpdate(state.currentOptions)}
				class="option-input"
			/>
		</div>
	</div>

	<div class="action-buttons">
		<button class="action-btn" onclick={() => state.clearCanvas()} type="button"> Clear </button>
		<button class="action-btn" onclick={() => state.save()} type="button"> Save </button>
		<button class="action-btn" onclick={() => state.undo()} type="button" disabled> Undo </button>
		<button class="action-btn" onclick={() => state.redo()} type="button" disabled> Redo </button>
	</div>
</div>

<style>
	.canvas-toolbar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3);
		padding: var(--spacing-4);
		background-color: var(--color-background-secondary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-custom36);
		width: 250px;
	}

	.tool-selector {
		display: flex;
		gap: var(--spacing-2);
		justify-content: space-between;
	}

	.tool-btn {
		flex: 1;
		padding: var(--spacing-2) var(--spacing-3);
		border: 1px solid var(--color-border-secondary);
		border-radius: var(--border-radius-base);
		background-color: var(--color-background-primary);
		cursor: pointer;
		transition: all var(--duration-200);
		font-size: var(--font-size-3);
	}

	.tool-btn:hover {
		background-color: var(--color-background-tertiary);
	}

	.tool-btn.active {
		background-color: var(--color-primary-600);
		color: var(--color-text-inverse);
		border-color: var(--color-primary-600);
	}

	.action-buttons {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-2);
	}

	.action-btn {
		padding: var(--spacing-2);
		border: 1px solid var(--color-border-secondary);
		border-radius: var(--border-radius-base);
		background-color: var(--color-background-primary);
		cursor: pointer;
		transition: all var(--duration-200);
		font-size: var(--font-size-3);
	}

	.action-btn:hover {
		background-color: var(--color-background-tertiary);
	}

	.tool-specific-options {
		margin-top: var(--spacing-3);
	}

	.option-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		margin-bottom: var(--spacing-3);
	}

	.option-label {
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.option-input {
		width: 100%;
		margin-top: var(--spacing-1);
	}

	.option-value {
		font-size: var(--font-size-3);
		color: var(--color-text-secondary);
		text-align: center;
	}
</style>
