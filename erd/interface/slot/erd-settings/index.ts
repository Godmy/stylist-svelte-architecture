import type { SchemaLayout } from '$stylist/erd/type/alias/schema-layout';
import type { SchemaGravitySettings } from '$stylist/erd/type/object/schema-gravity-settings';
export interface SlotErdSettings {
	title?: string;
	value?: string;
	zoom?: number;
	showRelations?: boolean;
	highlightRelations?: boolean;
	layout?: SchemaLayout;
	/** Target width / height for automatic domain grouping in the clusters layout. */
	clusterAspectRatio?: number;
	/** Optional semantic group for each table name; otherwise use its name prefix. */
	tableGroups?: Readonly<Record<string, string>>;
	/** Place this group in a dedicated left column in the clusters layout. */
	leadingCluster?: string;
	gravity?: SchemaGravitySettings;
	draggable?: boolean;
	textPanelVisible?: boolean;
	persistLayout?: boolean;
}
