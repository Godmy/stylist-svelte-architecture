import type { SchemaMode } from '$stylist/erd/type/alias/schema-mode';
import type { SlotErdSettings } from '$stylist/erd/interface/slot/erd-settings';
export interface SlotErdHeader extends SlotErdSettings {
	stats?: {
		tables: number;
		relations: number;
		errors: number;
	};
	canImport?: boolean;
	canExport?: boolean;
	mode?: SchemaMode;
}
