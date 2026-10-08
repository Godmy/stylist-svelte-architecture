import { untrack } from 'svelte';
import { DEFAULT_SCHEMA_TEXT } from '$stylist/erd/const/value/schema-text';
import { EDIT_CANDIDATE_SCHEMA_TEXT } from '$stylist/erd/const/value/schema-text-candidate';
import { SCIENCE_DOMAIN_SCHEMA_TEXT } from '$stylist/erd/const/value/schema-text-science-domain';
import { mergeSchemaDocuments } from '$stylist/erd/function/merge/schema-documents';
import { schemaDocumentToText } from '$stylist/erd/function/transform/schema-document-to-text';
import { schemaTextToDocument } from '$stylist/erd/function/transform/schema-text-to-document';
import type { SchemaMode } from '$stylist/erd/type/alias/schema-mode';
import type { SchemaLayout } from '$stylist/erd/type/alias/schema-layout';
import type { RecipeSchema } from '$stylist/erd/interface/recipe/schema';

export function createSchemaState(getProps: () => RecipeSchema) {
	const props = $derived(getProps());
	// Each of these intentionally captures the prop only once (uncontrolled
	// widget: initial value from the prop, then locally editable via the
	// toolbar/text editor) -- untrack() makes that explicit instead of
	// tripping the "did you mean a closure?" state_referenced_locally warning.
	let liveSource = $state<string>(untrack(() => props.value ?? DEFAULT_SCHEMA_TEXT));
	// Candidate pool for Mode: Edit -- see docs/chat/20260726/001-CLAUDE-ERD-EDIT.md.
	// Purely a format conversion of erd/data/md/schema/schema.md, nothing added
	// or removed yet.
	let editSource = $state<string>(EDIT_CANDIDATE_SCHEMA_TEXT);
	let currentZoom = $state(untrack(() => props.zoom ?? 1));
	let relationsVisible = $state(untrack(() => props.showRelations ?? true));
	let relationHighlight = $state(untrack(() => props.highlightRelations ?? true));
	let currentLayout = $state<SchemaLayout>(untrack(() => props.layout ?? 'grid'));
	let currentMode = $state<SchemaMode>('live');
	let textPanelVisible = $state(untrack(() => props.textPanelVisible ?? true));
	let fileInput: HTMLInputElement | undefined = $state();
	let schemaView: { saveLayout: () => void; resetLayout: () => void } | undefined = $state();

	let scienceDomainSource = $state<string>(SCIENCE_DOMAIN_SCHEMA_TEXT);
	let liveParseResult = $derived(schemaTextToDocument(liveSource));
	let editParseResult = $derived(schemaTextToDocument(editSource));
	let scienceDomainParseResult = $derived(schemaTextToDocument(scienceDomainSource));
	let migrateParseResult = $derived.by(() => {
		const merged = mergeSchemaDocuments(
			liveParseResult.document,
			scienceDomainParseResult.document
		);

		return {
			document: merged.document,
			errors: [...liveParseResult.errors, ...scienceDomainParseResult.errors, ...merged.errors]
		};
	});
	let parseResult = $derived.by(() => {
		if (currentMode === 'edit') {
			return editParseResult;
		}

		if (currentMode === 'migrate') {
			return migrateParseResult;
		}

		return liveParseResult;
	});
	let activeSource = $derived.by(() => {
		if (currentMode === 'edit') {
			return editSource;
		}

		if (currentMode === 'migrate') {
			return schemaDocumentToText(migrateParseResult.document);
		}

		return liveSource;
	});

	function clampZoom(nextZoom: number): number {
		return Math.min(1.8, Math.max(0.08, Number(nextZoom.toFixed(2))));
	}

	function importSchema(): void {
		fileInput?.click();
	}

	function exportSchema(): void {
		const blob = new Blob([activeSource], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href = url;
		link.download = `schema.${currentMode}.erd.txt`;
		link.click();
		URL.revokeObjectURL(url);
	}

	async function handleFileImport(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) {
			return;
		}

		const text = await file.text();

		if (currentMode === 'edit') {
			editSource = text;
		} else if (currentMode === 'migrate') {
			scienceDomainSource = text;
		} else {
			liveSource = text;
		}

		input.value = '';
	}

	function zoomIn(): void {
		currentZoom = clampZoom(currentZoom + 0.1);
	}

	function zoomOut(): void {
		currentZoom = clampZoom(currentZoom - 0.1);
	}

	function zoomReset(): void {
		currentZoom = 1;
	}

	function saveLayout(): void {
		schemaView?.saveLayout();
	}

	function resetLayout(): void {
		schemaView?.resetLayout();
	}

	return {
		get liveSource() {
			return liveSource;
		},
		set liveSource(value: string) {
			liveSource = value;
		},
		get editSource() {
			return editSource;
		},
		set editSource(value: string) {
			editSource = value;
		},
		get currentZoom() {
			return currentZoom;
		},
		get relationsVisible() {
			return relationsVisible;
		},
		get relationHighlight() {
			return relationHighlight;
		},
		get currentLayout() {
			return currentLayout;
		},
		get currentMode() {
			return currentMode;
		},
		get textPanelVisible() {
			return textPanelVisible;
		},
		get fileInput() {
			return fileInput;
		},
		set fileInput(value: HTMLInputElement | undefined) {
			fileInput = value;
		},
		get schemaView() {
			return schemaView;
		},
		set schemaView(value: { saveLayout: () => void; resetLayout: () => void } | undefined) {
			schemaView = value;
		},
		get parseResult() {
			return parseResult;
		},
		get activeSource() {
			return activeSource;
		},
		importSchema,
		exportSchema,
		handleFileImport,
		zoomIn,
		zoomOut,
		zoomReset,
		saveLayout,
		resetLayout,
		setLayout(layout: SchemaLayout) {
			currentLayout = layout;
		},
		setRelationsVisible(visible: boolean) {
			relationsVisible = visible;
		},
		setRelationHighlight(visible: boolean) {
			relationHighlight = visible;
		},
		setMode(mode: SchemaMode) {
			currentMode = mode;
		},
		setTextPanelVisible(visible: boolean) {
			textPanelVisible = visible;
		}
	};
}

export default createSchemaState;
