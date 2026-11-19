<script lang="ts">
	import type { RecipeErdDependency } from '$stylist/erd/interface/recipe/erd-dependency';

	let {
		dependency,
		x1,
		y1,
		x2,
		y2,
		pathData,
		active = false,
		dimmed = false,
		onHover
	}: RecipeErdDependency = $props();

	// A horizontal S-curve instead of a straight diagonal: on a dense diagram
	// (100+ tables, 200+ relations) straight lines criss-cross into an
	// unreadable mesh, while curves sharing a similar horizontal flow read as
	// distinct strands even where many of them bunch together.
	const bend = $derived(Math.max(40, Math.abs(x2 - x1) * 0.42));
	const direction = $derived(x2 >= x1 ? 1 : -1);
	const path = $derived(pathData ?? `M ${x1} ${y1} C ${x1 + direction * bend} ${y1}, ${x2 - direction * bend} ${y2}, ${x2} ${y2}`);
</script>

<g
	role="group"
	aria-label={dependency.label}
	class={`schema-dependency ${active ? 'schema-dependency--active' : ''} ${dimmed ? 'schema-dependency--dimmed' : ''}`}
	data-source-table={dependency.sourceTable}
	data-target-table={dependency.targetTable}
	data-dependency-id={dependency.id}
	onpointerenter={() => onHover?.(true)}
	onpointerleave={() => onHover?.(false)}
>
	<defs>
		<marker
			id={`schema-dependency-arrow-${dependency.id}`}
			viewBox="0 0 10 10"
			refX="8"
			refY="5"
			markerWidth="6"
			markerHeight="6"
			orient="auto-start-reverse"
		>
			<path d="M 0 0 L 10 5 L 0 10 z" />
		</marker>
	</defs>
	<path class="schema-dependency__hit" d={path} fill="none" />
	<path
		class="schema-dependency__line"
		d={path}
		fill="none"
		marker-end={`url(#schema-dependency-arrow-${dependency.id})`}
	/>
	<title>{dependency.label}</title>
</g>

<style>
	.schema-dependency__hit {
		stroke: transparent;
		stroke-width: 14;
		vector-effect: non-scaling-stroke;
		pointer-events: stroke;
		cursor: pointer;
	}
	.schema-dependency__line { pointer-events: none; }
	.schema-dependency__line {
		stroke: var(--color-text-tertiary, #6c7f99);
		stroke-width: 1.3;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.4;
		transition:
			opacity 0.15s ease,
			stroke-width 0.15s ease;
	}

	.schema-dependency defs path {
		fill: var(--color-text-tertiary, #6c7f99);
		opacity: 0.4;
		transition: opacity 0.15s ease;
	}

	.schema-dependency--active .schema-dependency__line {
		stroke: #d46b34;
		stroke-width: 2.2;
		opacity: 1;
	}

	.schema-dependency--active defs path {
		fill: #d46b34;
		opacity: 1;
	}

	/* Everything not touching the hovered/pinned table fades almost all the
	   way out -- this is the main noise-reduction lever on a dense diagram:
	   at rest all relations stay visible-but-quiet, and focusing a table
	   turns the rest of the mesh into a faint backdrop instead of removing
	   it outright (so the overall shape of the schema is still there). */
	.schema-dependency--dimmed .schema-dependency__line {
		opacity: 0.05;
	}

	.schema-dependency--dimmed defs path {
		opacity: 0.05;
	}
	.schema-dependency:hover .schema-dependency__line {
		stroke: #d46b34;
		stroke-width: 3;
		opacity: 1;
	}
	.schema-dependency:hover defs path {
		fill: #d46b34;
		opacity: 1;
	}
</style>
