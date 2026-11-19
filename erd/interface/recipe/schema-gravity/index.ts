import type { SchemaGravityZone } from '$stylist/erd/type/object/schema-gravity-zone';

export interface RecipeSchemaGravity {
	radius: number;
	strength: number;
	zones: readonly SchemaGravityZone[];
	selectedId: string | null;
	onRadiusChange: (value: number) => void;
	onStrengthChange: (value: number) => void;
	onAdd: () => void;
	onSelect: (id: string) => void;
	onUpdate: (id: string, patch: Partial<Pick<SchemaGravityZone,'radius'|'strength'>>) => void;
	onRemove: (id: string) => void;
	onToggle: (open: boolean) => void;
	onReset: () => void;
}
