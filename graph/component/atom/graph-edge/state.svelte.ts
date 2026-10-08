import type { RecipeGraphEdge } from '$stylist/graph/interface/recipe/graph-edge';
import type { TokenTrajectory } from '$stylist/workspace/type/alias/trajectory';

export function createGraphEdgeState(getProps: () => RecipeGraphEdge) {
	const props = $derived(getProps());
	const directed = $derived(props.directed ?? false);
	const type = $derived((props.type ?? 'straight') as TokenTrajectory);
	const active = $derived(Boolean(props.active));
	const style = $derived(props.style ?? {});

	const classes = $derived.by(() => {
		const parts = ['graph-edge'];
		if (directed) parts.push('graph-edge--directed');
		if (active) parts.push('graph-edge--active');
		if (type === 'arc') parts.push('graph-edge--arc');
		if (type === 'polyline' || type === 'elbow' || type === 'step')
			parts.push('graph-edge--polyline');
		if (type === 'straight') parts.push('graph-edge--straight');
		return parts.join(' ');
	});

	const styles = $derived.by(() => {
		const left = typeof style.left === 'number' ? `${style.left}px` : `${style.left ?? 0}`;
		const top = typeof style.top === 'number' ? `${style.top}px` : `${style.top ?? 0}`;
		const length =
			typeof style.length === 'number' ? `${style.length}px` : `${style.length ?? 120}`;
		const height = typeof style.height === 'number' ? `${style.height}px` : `${style.height ?? 56}`;
		const angle =
			typeof style.angle === 'number' ? `${style.angle}deg` : `${style.angle ?? '0deg'}`;
		const color = String(style.color ?? 'var(--color-text-secondary)');
		const thickness =
			typeof style.thickness === 'number' ? `${style.thickness}px` : `${style.thickness ?? 2}px`;

		return [
			`--edge-left:${left}`,
			`--edge-top:${top}`,
			`--edge-length:${length}`,
			`--edge-height:${height}`,
			`--edge-angle:${angle}`,
			`--edge-color:${color}`,
			`--edge-thickness:${thickness}`,
			`--edge-active-color:${String(style.activeColor ?? 'var(--color-text-primary)')}`,
			`--edge-directed-color:${String(style.directedColor ?? 'var(--color-primary-600)')}`
		].join(';');
	});

	return {
		get directed() {
			return directed;
		},
		get type() {
			return type;
		},
		get active() {
			return active;
		},
		get classes() {
			return classes;
		},
		get styles() {
			return styles;
		}
	};
}

export default createGraphEdgeState;
