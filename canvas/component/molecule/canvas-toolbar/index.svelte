<script lang="ts">
	import type { RecipeCanvasToolbar } from '$stylist/canvas/interface/recipe/canvas-toolbar';
	import createCanvasToolbarState from '$stylist/canvas/component/molecule/canvas-toolbar/state.svelte';
	import { CANVAS_TOOLBAR_DRAWING_TOOL } from '$stylist/canvas/const/array/canvas-toolbar-drawing-tool';
	import { CANVAS_CANVAS_TOOLBAR_MESSAGE } from '$stylist/canvas/const/record/canvas-toolbar-message';
	import { useMessage } from '$stylist/localization/function/hook/use-message';

	const props: RecipeCanvasToolbar = $props();
	const t = useMessage('canvas-toolbar', CANVAS_CANVAS_TOOLBAR_MESSAGE);
	const state = createCanvasToolbarState(() => props);
	const lineWidthId = $props.id();
</script>

<div class={['canvas-toolbar', props.class]} role="toolbar" aria-label={t('label')}>
	<div class="tool-selector" role="group">
		{#each CANVAS_TOOLBAR_DRAWING_TOOL as tool (tool)}
			<button
				class={['tool-btn', state.currentTool === tool && 'active']}
				aria-pressed={state.currentTool === tool}
				onclick={() => state.selectTool(tool)}
				type="button"
			>
				{t(tool)}
			</button>
		{/each}
	</div>

	<div class="tool-specific-options">
		<div class="option-group">
			<label for="{lineWidthId}-width" class="option-label">{t('lineWidth')}</label>
			<input
				id="{lineWidthId}-width"
				type="range"
				min="1"
				max="40"
				value={state.currentOptions.lineWidth}
				oninput={(event) => state.setLineWidth(Number(event.currentTarget.value))}
				class="option-input"
			/>
			<span class="option-value">{state.currentOptions.lineWidth}px</span>
		</div>

		<div class="option-group">
			<label for="{lineWidthId}-color" class="option-label">{t('color')}</label>
			<input
				id="{lineWidthId}-color"
				type="color"
				value={state.currentOptions.strokeColor}
				oninput={(event) => state.setStrokeColor(event.currentTarget.value)}
				class="option-input"
				disabled={state.currentTool === 'eraser'}
			/>
		</div>
	</div>

	<div class="action-buttons">
		<button class="action-btn" onclick={state.clearCanvas} type="button">{t('clear')}</button>
		<button class="action-btn" onclick={state.save} type="button">{t('save')}</button>
		<button class="action-btn" onclick={state.undo} type="button" disabled={!state.canUndo}>
			{t('undo')}
		</button>
		<button class="action-btn" onclick={state.redo} type="button" disabled={!state.canRedo}>
			{t('redo')}
		</button>
	</div>
</div>

<style>
	.canvas-toolbar {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--color-background-secondary);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-custom36);
		width: 250px;
	}

	.tool-selector {
		display: flex;
		gap: var(--space-2);
		justify-content: space-between;
	}

	.tool-btn {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-secondary);
		border-radius: var(--radius-1-5);
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
		gap: var(--space-2);
	}

	.action-btn {
		padding: var(--space-2);
		border: 1px solid var(--color-border-secondary);
		border-radius: var(--radius-1-5);
		background-color: var(--color-background-primary);
		cursor: pointer;
		transition: all var(--duration-200);
		font-size: var(--font-size-3);
	}

	.action-btn:hover:not(:disabled) {
		background-color: var(--color-background-tertiary);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.tool-specific-options {
		margin-top: var(--space-3);
	}

	.option-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-3);
	}

	.option-label {
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-primary);
	}

	.option-input {
		width: 100%;
		margin-top: var(--space-1);
	}

	.option-value {
		font-size: var(--font-size-3);
		color: var(--color-text-secondary);
		text-align: center;
	}
</style>
