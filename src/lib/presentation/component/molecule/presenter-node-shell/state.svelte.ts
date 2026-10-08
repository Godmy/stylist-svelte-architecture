import { ClassNamesManager } from '$stylist/layout/class/manager/class-names';
import { useSemanticZoom } from '$stylist/presentation/function/script/use-semantic-zoom';
import type { RecipePresenterNodeShell } from '$stylist/presentation/interface/recipe/presenter-node-shell';

export function createPresenterNodeShellState(getProps: () => RecipePresenterNodeShell) {
	const props = $derived(getProps());
	const zoom = useSemanticZoom({
		node: props.node,
		get cameraDepth() {
			return props.camera.depth;
		}
	});

	const presentation = $derived.by(() => zoom.presentation);
	const projectedScale = $derived.by(() => presentation.scale * props.camera.zoom);
	const hostClass = $derived(
		ClassNamesManager.merge(
			'presenter-node-shell',
			`presenter-node-shell--stage-${presentation.stage}`,
			`presenter-node-shell--architecture-${presentation.architecture}`,
			`presenter-node-shell--layer-${presentation.layer}`,
			(props.selected ?? false) && 'presenter-node-shell--selected',
			props.class ?? ''
		)
	);
	const hostStyle = $derived.by(() =>
		[
			`left:${props.node.position.x}px`,
			`top:${props.node.position.y}px`,
			`width:${presentation.width}px`,
			`min-height:${presentation.height}px`,
			`transform:translate(-50%, -50%) scale(${presentation.scale})`,
			`border-color:${props.node.accent}`,
			`box-shadow:${props.selected ? `0 0 0 2px ${props.node.accent}` : 'none'}`
		].join(';')
	);
	const showCard = $derived.by(
		() =>
			presentation.stage === 'compact' ||
			presentation.stage === 'detailed' ||
			presentation.stage === 'screen'
	);

	function select(): void {
		props.onselect?.(props.node);
	}

	return {
		get presentation() {
			return presentation;
		},
		get hostClass() {
			return hostClass;
		},
		get hostStyle() {
			return hostStyle;
		},
		get showCard() {
			return showCard;
		},
		select
	};
}

export default createPresenterNodeShellState;
