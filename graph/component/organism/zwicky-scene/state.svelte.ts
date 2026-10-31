import { ClassNamesManager } from '$stylist/layout/class/manager/class-names';
import { GraphScriptManager } from '$stylist/graph/class/manager/graph-script';
import { InstancedGraphManager } from '$stylist/graph/class/manager/instanced-graph';
import type { RecipeZwickyScene } from '$stylist/graph/interface/recipe/zwicky-scene';
import { GRAPH_ZWICKY_SCENE_MESSAGE } from '$stylist/graph/const/record/zwicky-scene-message';
import { useMessage } from '$stylist/localization/function/hook/use-message';
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
	let facetFilter = $state(new Map<string, Set<string>>());
	let filterQuery = $state('');
	let includeRelated = $state(true);
	let showLinks = $state(true);
	let panelOpen = $state(true);
	let viewCounts = $state({ nodes: 0, edges: 0, matched: 0, related: 0 });
	let allNodeIds: string[] = [];
	const filterGroups = $derived(
		(props.scheme?.filterGroups ?? [])
			.map((group) => ({
				...group,
				options: group.options.filter(
					(option) =>
						!filterQuery.trim() ||
						(group.label + ' ' + option.label)
							.toLocaleLowerCase()
							.includes(filterQuery.trim().toLocaleLowerCase())
				)
			}))
			.filter((group) => group.options.length)
	);
	const activeFacets = $derived(
		(props.scheme?.filterGroups ?? []).flatMap((group) =>
			group.options
				.filter((option) => facetFilter.get(group.id)?.has(option.id))
				.map((option) => ({ group: group.id, id: option.id, label: option.label }))
		)
	);

	const containerClass = $derived(
		ClassNamesManager.merge('zwicky-scene', props.class?.toString() ?? '')
	);
	const canvasClass = $derived(
		ClassNamesManager.merge('zwicky-scene__canvas', props.canvasClass?.toString() ?? '')
	);
	const overlayClass = $derived(
		ClassNamesManager.merge('zwicky-scene__overlay', props.overlayClass?.toString() ?? '')
	);
	const t = useMessage('zwicky-scene', GRAPH_ZWICKY_SCENE_MESSAGE);
	const title = $derived(props.title ?? t('title'));
	const text = $derived({
		badge: props.text?.badge ?? t('badge'),
		nodes: props.text?.nodes ?? t('nodes'),
		edges: props.text?.edges ?? t('edges'),
		render: props.text?.render ?? t('render'),
		selected: props.text?.selected ?? t('selected'),
		dependencies: props.text?.dependencies ?? t('dependencies'),
		clear: props.text?.clear ?? t('clear'),
		hint: props.text?.hint ?? t('hint'),
		clusters: props.text?.clusters,
		domains: props.text?.domains,
		filters: props.text?.filters ?? 'Filters',
		searchFilters: props.text?.searchFilters ?? 'Search filters',
		related: props.text?.related ?? 'Include directly connected nodes',
		showLinks: props.text?.showLinks ?? 'Show connections',
		filterHelp: props.text?.filterHelp ?? 'OR within a group, AND between groups.',
		filtersEmpty: props.text?.filtersEmpty ?? 'No filters selected: all nodes are shown.',
		matched: props.text?.matched ?? 'Matching',
		context: props.text?.context ?? 'Connected',
		empty: props.text?.empty ?? 'No matching nodes. Clear a filter to broaden the result.',
		noOptions: props.text?.noOptions ?? 'No matching filters',
		clearSelection: props.text?.clearSelection ?? 'Clear node selection',
		selectionHint: props.text?.selectionHint ?? 'Only connections of the selected node are shown.',
		showFilters: props.text?.showFilters ?? 'Show filters',
		hideFilters: props.text?.hideFilters ?? 'Hide filters'
	});

	const restProps = $derived.by(() => {
		const {
			title: _t,
			data: _d,
			canvasClass: _cc,
			overlayClass: _oc,
			class: _c,
			onNodeSelect: _ns,
			onViewChange: _vc,
			panelHeading: _ph,
			panelMetrics: _pm,
			scheme: _s,
			text: _tx,
			theme: _th,
			...rest
		} = props;
		return rest;
	});

	let pollTimer: ReturnType<typeof setInterval> | null = null;

	function updateViewCounts(): void {
		viewCounts = manager.getViewCounts();
		props.onViewChange?.({
			nodes: viewCounts.nodes,
			edges: viewCounts.edges,
			totalNodes: nodeCount,
			totalEdges: edgeCount,
			filters: activeFacets.length
		});
	}

	manager.onSelect = (node: ZwickyNode | null) => {
		selectedNode = node;
		props.onNodeSelect?.(node?.id ?? '', node?.path ?? '');
		updateViewCounts();
	};

	function clearSelection(): void {
		selectedNode = null;
		manager.setSelected(null);
		props.onNodeSelect?.('', '');
		updateViewCounts();
	}

	function applyFacets(): void {
		clearSelection();
		const ids = GraphScriptManager.matchZwickyFilters(
			props.scheme?.filterGroups ?? [],
			facetFilter,
			allNodeIds
		);
		manager.setNodeFilter(ids, includeRelated);
		updateViewCounts();
	}

	function toggleFacet(group: string, id: string): void {
		const next = new Map(facetFilter);
		const selected = new Set(next.get(group) ?? []);
		if (selected.has(id)) selected.delete(id);
		else selected.add(id);
		if (selected.size) next.set(group, selected);
		else next.delete(group);
		facetFilter = next;
		applyFacets();
	}

	function toggleRelated(): void {
		includeRelated = !includeRelated;
		applyFacets();
	}
	function toggleLinks(): void {
		showLinks = !showLinks;
		manager.setLinksVisible(showLinks);
		updateViewCounts();
	}

	function loadData(): void {
		const input = props.data;
		if (!input) return;

		const { nodes, edges } = GraphScriptManager.parseZwickyGraph(input, props.scheme);
		GraphScriptManager.layoutZwickyNodes(
			nodes,
			props.scheme?.clusters.map((group) => group.id),
			props.scheme?.heightScale,
			props.scheme?.radialLayout
		);
		const scale = props.scheme?.layoutScale ?? 1;
		GraphScriptManager.applyZwickyPositions(
			nodes,
			props.scheme?.positions,
			scale,
			props.scheme?.nodeScale
		);
		manager.setReferenceLines(props.scheme?.referenceLines ?? [], scale);
		manager.setGraph(nodes, edges);
		allNodeIds = nodes.map((node) => node.id);
		nodeCount = nodes.length;
		edgeCount = edges.length;
		if (props.scheme?.filterGroups) applyFacets();
		updateViewCounts();
		isLoaded = true;
	}

	function mount(canvas: HTMLCanvasElement | null): void {
		if (!canvas) return;
		if (props.scheme?.filterGroups && canvas.clientWidth < 640) panelOpen = false;
		// A light page gets a warm off-white canvas and pastel edges instead of the night sky.
		if (props.theme === 'light') manager.setTheme('light', props.scheme?.edgeTint);
		if (props.scheme?.edgeFilter) manager.setEdgeFilter(props.scheme.edgeFilter);
		if (props.scheme?.edgeOpacity !== undefined) manager.setEdgeOpacity(props.scheme.edgeOpacity);
		if (props.scheme?.camera) manager.setCameraOrbit(props.scheme.camera);
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
		facetFilter = new Map();
		filterQuery = '';
		domainFilter = new Set();
		clusterFilter = new Set();
		manager.setDomainFilter(new Set());
		manager.setClusterFilter(new Set());
		if (props.scheme?.filterGroups) applyFacets();
		else clearSelection();
	}

	function toggleCluster(cluster: string): void {
		const next = new Set(clusterFilter);
		if (next.has(cluster)) next.delete(cluster);
		else next.add(cluster);
		clusterFilter = next;
		manager.setClusterFilter(next);
	}

	return {
		get facetFilter() {
			return facetFilter;
		},
		get filterGroups() {
			return filterGroups;
		},
		get activeFacets() {
			return activeFacets;
		},
		get filterQuery() {
			return filterQuery;
		},
		get includeRelated() {
			return includeRelated;
		},
		get showLinks() {
			return showLinks;
		},
		get panelOpen() {
			return panelOpen;
		},
		get viewCounts() {
			return viewCounts;
		},
		toggleFacet,
		toggleRelated,
		toggleLinks,
		setFilterQuery(value: string) {
			filterQuery = value;
		},
		togglePanel() {
			panelOpen = !panelOpen;
		},
		clearSelection,
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
