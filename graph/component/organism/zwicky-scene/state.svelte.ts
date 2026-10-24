import { ClassNamesManager } from '$stylist/layout/class/manager/class-names';
import { GraphScriptManager } from '$stylist/graph/class/manager/graph-script';
import { InstancedGraphManager } from '$stylist/graph/class/manager/instanced-graph';
import type { RecipeZwickyScene } from '$stylist/graph/interface/recipe/zwicky-scene';
import type { ZwickyNode } from '$stylist/graph/interface/slot/zwicky-node';

export function createZwickySceneState(getProps: () => RecipeZwickyScene) {
	const props = $derived(getProps());
	const manager = new InstancedGraphManager();

	let selectedNode = $state<ZwickyNode | null>(null);
	let hoveredNode = $state<ZwickyNode | null>(null);
	let hoverPos = $state<{ x: number; y: number } | null>(null);
	let nodeCount = $state(0);
	let edgeCount = $state(0);
	let isLoaded = $state(false);
	let domainFilter = $state(new Set<string>());
	let clusterFilter = $state(new Set<string>());
	let containerWidth = $state(800);
	let containerHeight = $state(600);

	const containerClass = $derived(
		ClassNamesManager.merge('zwicky-scene', props.class?.toString() ?? '')
	);
	const canvasClass = $derived(
		ClassNamesManager.merge('zwicky-scene__canvas', props.canvasClass?.toString() ?? '')
	);
	const overlayClass = $derived(
		ClassNamesManager.merge('zwicky-scene__overlay', props.overlayClass?.toString() ?? '')
	);
	const title = $derived(props.title ?? 'Zwicky Graph');
	const text = $derived({
		badge: props.text?.badge ?? 'WebGL2 · Instanced',
		nodes: props.text?.nodes ?? 'nodes',
		edges: props.text?.edges ?? 'edges',
		render: props.text?.render ?? 'render',
		selected: props.text?.selected ?? 'selected',
		dependencies: props.text?.dependencies ?? 'deps',
		clear: props.text?.clear ?? '✕ clear all filters',
		hint: props.text?.hint ?? 'Drag · Wheel · F fit · Click select · Pills filter',
		clusters: props.text?.clusters,
		domains: props.text?.domains
	});

	const restProps = $derived.by(() => {
		const {
			title: _t,
			data: _d,
			canvasClass: _cc,
			overlayClass: _oc,
			class: _c,
			onNodeSelect: _ns,
			scheme: _s,
			text: _tx,
			theme: _th,
			...rest
		} = props;
		return rest;
	});

	let pollTimer: ReturnType<typeof setInterval> | null = null;

	manager.onSelect = (node: ZwickyNode) => {
		selectedNode = node;
		props.onNodeSelect?.(node.id, node.path);
	};

	function loadData(): void {
		const input = props.data;
		if (!input) return;

		const { nodes, edges } = GraphScriptManager.parseZwickyGraph(input, props.scheme);
		GraphScriptManager.layoutZwickyNodes(
			nodes,
			props.scheme?.clusters.map((group) => group.id)
		);
		manager.setGraph(nodes, edges);
		nodeCount = nodes.length;
		edgeCount = edges.length;
		isLoaded = true;
	}

	function mount(canvas: HTMLCanvasElement | null): void {
		if (!canvas) return;
		// A light page gets a warm off-white canvas and pastel edges instead of the night sky.
		if (props.theme === 'light') manager.setTheme('light', props.scheme?.edgeTint);
		if (props.scheme?.edgeFilter) manager.setEdgeFilter(props.scheme.edgeFilter);
		manager.start(canvas);
		loadData();

		// Poll hover + container size every 80ms
		pollTimer = setInterval(() => {
			hoveredNode = manager.getHoveredNode();
			hoverPos = manager.getHoverPos();
			if (canvas.parentElement) {
				containerWidth = canvas.parentElement.clientWidth;
				containerHeight = canvas.parentElement.clientHeight;
			}
		}, 80);
	}

	function destroy(): void {
		if (pollTimer !== null) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
		manager.stop();
	}

	function toggleDomain(domain: string): void {
		const next = new Set(domainFilter);
		if (next.has(domain)) {
			next.delete(domain);
		} else {
			next.add(domain);
		}
		domainFilter = next;
		manager.setDomainFilter(next);
	}

	function clearFilter(): void {
		domainFilter = new Set();
		clusterFilter = new Set();
		manager.setDomainFilter(new Set());
		manager.setClusterFilter(new Set());
	}

	function toggleCluster(cluster: string): void {
		const next = new Set(clusterFilter);
		if (next.has(cluster)) next.delete(cluster);
		else next.add(cluster);
		clusterFilter = next;
		manager.setClusterFilter(next);
	}

	return {
		get containerClass() {
			return containerClass;
		},
		get canvasClass() {
			return canvasClass;
		},
		get overlayClass() {
			return overlayClass;
		},
		get title() {
			return title;
		},
		get text() {
			return text;
		},
		get scheme() {
			return props.scheme;
		},
		get theme() {
			return props.theme ?? 'dark';
		},
		get restProps() {
			return restProps;
		},
		get selectedNode() {
			return selectedNode;
		},
		get hoveredNode() {
			return hoveredNode;
		},
		get hoverPos() {
			return hoverPos;
		},
		get nodeCount() {
			return nodeCount;
		},
		get edgeCount() {
			return edgeCount;
		},
		get isLoaded() {
			return isLoaded;
		},
		get domainFilter() {
			return domainFilter;
		},
		get clusterFilter() {
			return clusterFilter;
		},
		get containerWidth() {
			return containerWidth;
		},
		get containerHeight() {
			return containerHeight;
		},
		toggleDomain,
		toggleCluster,
		clearFilter,
		mount,
		destroy
	};
}

export default createZwickySceneState;
