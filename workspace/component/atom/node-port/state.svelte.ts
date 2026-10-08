import type { RecipeNodePort as NodePortProps } from '$stylist/workspace/interface/recipe/node-port';
import type { TokenSize } from '$stylist/theme/type/alias/size';

const PORT_SIZE_MAP: Record<string, string> = {
	xs: 'node-port--xs',
	sm: 'node-port--sm',
	md: 'node-port--md',
	lg: 'node-port--lg',
	xl: 'node-port--xl',
	'2xl': 'node-port--2xl',
	'1/4': 'node-port--xs',
	'1/3': 'node-port--sm',
	'2/5': 'node-port--sm',
	'1/2': 'node-port--md',
	'3/5': 'node-port--md',
	'2/3': 'node-port--lg',
	'3/4': 'node-port--xl',
	full: 'node-port--2xl'
};

export function createNodePortState(getProps: () => NodePortProps) {
	const props = $derived(getProps());
	const direction = $derived(props.direction === 'input' ? 'input' : 'output');
	const size = $derived((props.size ?? 'md') as TokenSize);
	const dataType = $derived(props.dataType ?? 'any');
	const connected = $derived(Boolean(props.connected));
	const active = $derived(Boolean(props.active));
	const color = $derived(
		props.color ?? `var(--color-graph-port-type-${dataType}, var(--color-graph-port-type-any))`
	);

	const sizeClasses = $derived(PORT_SIZE_MAP[size] ?? 'node-port--md');
	const stateClasses = $derived(
		`node-port${connected ? ' node-port--connected' : ''}${active ? ' node-port--active' : ''}`
	);
	const styles = $derived(
		direction === 'input'
			? `--node-port-color: ${color}; left: -6px; transform: translateX(-100%);`
			: `--node-port-color: ${color}; right: -6px; transform: translateX(100%);`
	);

	return {
		get direction() {
			return direction;
		},
		get size() {
			return size;
		},
		get dataType() {
			return dataType;
		},
		get connected() {
			return connected;
		},
		get active() {
			return active;
		},
		get color() {
			return color;
		},
		get sizeClasses() {
			return sizeClasses;
		},
		get stateClasses() {
			return stateClasses;
		},
		get styles() {
			return styles;
		}
	};
}

export default createNodePortState;
