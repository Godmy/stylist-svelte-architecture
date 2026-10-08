import type { SchemaMode } from '$stylist/erd/type/alias/schema-mode';
import type { SlotErdSettings } from '$stylist/erd/interface/slot/erd-settings';
export interface SlotErdTool extends SlotErdSettings {
	canImport?: boolean;
	canExport?: boolean;
	mode?: SchemaMode;
}
