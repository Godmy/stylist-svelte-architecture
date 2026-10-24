<script lang="ts">
	import HtmlButton from '$stylist/html/component/atom/button/index.svelte';
	import HtmlH2 from '$stylist/html/component/atom/h2/index.svelte';
	import HtmlInputColor from '$stylist/html/component/atom/input-color/index.svelte';
	import HtmlInputRange from '$stylist/html/component/atom/input-range/index.svelte';
	import HtmlLabel from '$stylist/html/component/atom/label/index.svelte';
	import HtmlP from '$stylist/html/component/atom/p/index.svelte';
	import HtmlSmall from '$stylist/html/component/atom/small/index.svelte';
	import HtmlSection from '$stylist/html/component/organism/section/index.svelte';
	import InterferenceFieldScene from '$stylist/webgl/component/molecule/interference-field-scene/index.svelte';
	import type { RecipeShaderField } from '$stylist/webgl/interface/recipe/shader-field';

	let {
		element = $bindable(null),
		title = 'Световое поле',
		class: className,
		...rest
	}: RecipeShaderField = $props();

	let speed = $state(1);
	let color = $state('#80b7eb');
	let supported = $state(true);
</script>

<HtmlSection bind:element {...rest} class={['c-shader-field', className]} aria-label={title}>
	<HtmlSection
		class="c-shader-field__stage"
		data-renderer={supported ? 'webgl' : 'fallback'}
		aria-label="Шейдер светового поля"
	>
		{#if supported}
			<InterferenceFieldScene {speed} {color} onUnsupported={() => (supported = false)} />
		{/if}
		<HtmlSmall role="status" class="c-shader-field__status">
			{supported ? 'WebGL2 / GLSL' : 'WebGL недоступен. Показан статичный фон.'}
		</HtmlSmall>
	</HtmlSection>
	<HtmlSection class="c-shader-field__panel">
		<HtmlH2 class="c-shader-field__title">Параметры поля</HtmlH2>
		<HtmlLabel class="c-shader-field__field">
			Скорость поля
			<HtmlInputRange min="0" max="3" step="0.1" bind:value={speed} />
			{speed}
		</HtmlLabel>
		<HtmlLabel class="c-shader-field__field">
			Цвет поля
			<HtmlInputColor bind:value={color} />
		</HtmlLabel>
		<HtmlButton
			type="button"
			class="c-shader-field__button"
			onclick={() => (speed = speed === 0 ? 1 : 0)}
		>
			{speed === 0 ? 'Продолжить поле' : 'Остановить поле'}
		</HtmlButton>
		<HtmlP>
			Размер canvas адаптируется к контейнеру. При reduced motion время сцены остаётся неподвижным.
		</HtmlP>
		<HtmlP>Это настоящий WebGL-шейдер без зависимости от Three.js.</HtmlP>
	</HtmlSection>
</HtmlSection>

<style>
	:global {
		.c-shader-field {
			display: grid;
			grid-template-columns: minmax(0, 1.6fr) minmax(15.625rem, 1fr);
			align-items: start;
			gap: calc(var(--layout-spacing-1rem, 1rem) * 1.5);
			color: var(--color-text-primary);
		}
		.c-shader-field__stage {
			position: relative;
			height: 26.875rem;
			overflow: hidden;
			border-radius: var(--layout-border-radius-xxl, 1rem);
			background: radial-gradient(
				ellipse,
				var(--color-primary-800, #1e40af),
				var(--color-background-inverse, #0f172a) 65%
			);
		}
		.c-shader-field__status {
			position: absolute;
			bottom: var(--layout-spacing-1rem, 1rem);
			left: var(--layout-spacing-1rem, 1rem);
			font-size: var(--typography-font-size-3, 0.75rem);
			color: var(--color-text-inverse, #fff);
		}
		.c-shader-field__panel {
			display: flex;
			flex-direction: column;
			gap: calc(var(--layout-spacing-1rem, 1rem) * 0.75);
			padding: calc(var(--layout-spacing-1rem, 1rem) * 1.5);
			border: var(--border-width-thin, 1px) solid var(--color-border-primary);
			border-radius: var(--layout-border-radius-xl, 0.75rem);
			background: var(--color-background-primary);
		}
		.c-shader-field__title {
			margin: 0;
			font-size: var(--typography-font-size-5, 1.25rem);
		}
		.c-shader-field__field {
			display: flex;
			flex-direction: column;
			gap: calc(var(--layout-spacing-1rem, 1rem) / 4);
			font-weight: var(--typography-font-weight-medium, 500);
		}
		.c-shader-field__button {
			padding: var(--density-block, 0.5rem) var(--density-inline, 0.75rem);
			border: var(--border-width-thin, 1px) solid var(--color-primary-600);
			border-radius: var(--layout-border-radius-md, 0.375rem);
			background: var(--color-primary-600);
			color: var(--color-on-primary, #fff);
			font: inherit;
			cursor: pointer;
		}
		.c-shader-field__button:focus-visible {
			outline: var(--focus-width, 2px) solid var(--color-border-accent, var(--color-primary-500));
			outline-offset: var(--focus-offset, 0.125rem);
		}
		@media (max-width: 760px) {
			.c-shader-field {
				grid-template-columns: 1fr;
			}
			.c-shader-field__stage {
				height: 20rem;
			}
		}
	}
</style>
