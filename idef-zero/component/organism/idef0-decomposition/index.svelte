<script lang="ts">
	import type { RecipeIdef0Decomposition } from '$stylist/idef-zero/interface/recipe/idef0-decomposition';
	import createIdef0DecompositionState from '$stylist/idef-zero/component/organism/idef0-decomposition/state.svelte';

	let props: RecipeIdef0Decomposition = $props();
	const state = createIdef0DecompositionState(() => props);
	const LINE = 13;
	const path = (points: [number, number][]) =>
		points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
</script>

<figure class={state.containerClasses}>
	{#if props.title}
		<figcaption class="idef0-decomposition__title">{props.title}</figcaption>
	{/if}
	<div class="idef0-decomposition__scroll">
		<svg
			class="idef0-decomposition__svg"
			width={state.layout.width}
			height={state.layout.height}
			viewBox={`0 0 ${state.layout.width} ${state.layout.height}`}
			role="img"
			aria-label={props.title ?? props.activities.map((a) => `${a.id} ${a.title}`).join('; ')}
		>
			{#each state.layout.arrows as arrow (arrow.key)}
				<g
					class="idef0-decomposition__arrow"
					class:idef0-decomposition__arrow--internal={arrow.internal}
					style:--idef0-arrow-color={arrow.color}
				>
					<path d={path(arrow.points)} />
					<polygon points={arrow.head} />
				</g>
			{/each}
			{#each state.layout.boxes as box (box.id)}
				<g class="idef0-decomposition__box">
					<rect x={box.x} y={box.y} width={box.width} height={box.height} rx="12" ry="12" />
					<text
						class="idef0-decomposition__box-title"
						x={box.x + box.width / 2}
						y={box.y + box.height / 2 - ((box.title.length - 1) * 17) / 2 + 5}
						text-anchor="middle"
					>
						{#each box.title as line, i (i)}
							<tspan x={box.x + box.width / 2} dy={i ? 17 : 0}>{line}</tspan>
						{/each}
					</text>
					<text class="idef0-decomposition__box-id" x={box.x + box.width - 10} y={box.y + box.height - 9} text-anchor="end">
						{box.id}
					</text>
				</g>
			{/each}
			{#each state.layout.arrows as arrow (arrow.key)}
				<text
					class="idef0-decomposition__label"
					class:idef0-decomposition__label--internal={arrow.internal}
					x={arrow.label.x}
					y={arrow.label.y}
					text-anchor={arrow.label.anchor}
				>
					{#each arrow.label.lines as line, i (i)}
						<tspan x={arrow.label.x} dy={i ? LINE : 0}>{line}</tspan>
					{/each}
				</text>
			{/each}
		</svg>
	</div>
</figure>

<style>
	.idef0-decomposition {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 1rem;
		border: 1px solid var(--color-border-primary, #d9dee5);
		border-radius: 1rem;
		background: var(--color-background-primary, #fff);
		--idef0-ink: var(--color-text-primary, #172033);
		--idef0-muted: var(--color-text-secondary, #5b6676);
		--idef0-accent: var(--color-primary-500, #0f766e);
		--idef0-paper: var(--color-background-primary, #fff);
	}

	.idef0-decomposition__title {
		color: var(--idef0-ink);
		font-weight: 600;
	}

	/* The diagram keeps its drawn size; a narrow container scrolls it sideways. */
	.idef0-decomposition__scroll {
		overflow-x: auto;
	}

	.idef0-decomposition__svg {
		display: block;
	}

	.idef0-decomposition__arrow {
		color: var(--idef0-arrow-color, var(--idef0-muted));
	}

	.idef0-decomposition__arrow--internal {
		color: var(--idef0-arrow-color, var(--idef0-accent));
	}

	.idef0-decomposition__arrow path {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linejoin: round;
	}

	.idef0-decomposition__arrow polygon {
		fill: currentColor;
	}

	.idef0-decomposition__box rect {
		fill: color-mix(in srgb, var(--idef0-accent) 7%, var(--idef0-paper));
		stroke: color-mix(in srgb, var(--idef0-accent) 55%, var(--idef0-paper));
		stroke-width: 1.5;
	}

	.idef0-decomposition__box-title {
		fill: var(--idef0-ink);
		font-size: 14px;
		font-weight: 600;
	}

	.idef0-decomposition__box-id {
		fill: var(--idef0-accent);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	/* A halo of the paper colour keeps labels legible where lines cross them. */
	.idef0-decomposition__label {
		fill: var(--idef0-muted);
		font-size: 12px;
		paint-order: stroke;
		stroke: var(--idef0-paper);
		stroke-width: 4px;
		stroke-linejoin: round;
	}

	.idef0-decomposition__label--internal {
		fill: color-mix(in srgb, var(--idef0-accent) 80%, var(--idef0-ink));
		font-weight: 500;
	}
</style>
