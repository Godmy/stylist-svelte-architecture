import type { SchemaLayout } from '$stylist/erd/type/alias/schema-layout';
export interface SlotErdSettings {
	title?: string;
	value?: string;
	zoom?: number;
	showRelations?: boolean;
	highlightRelations?: boolean;
	layout?: SchemaLayout;
	/** Target width / height for automatic domain grouping in the clusters layout. */
	clusterAspectRatio?: number;
	draggable?: boolean;
	textPanelVisible?: boolean;
	persistLayout?: boolean;
}
