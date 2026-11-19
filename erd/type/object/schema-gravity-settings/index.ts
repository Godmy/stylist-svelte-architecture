import type { SchemaGravityZone } from '$stylist/erd/type/object/schema-gravity-zone';

export type SchemaGravitySettings = {
	radius?: number;
	strength?: number;
	zones?: readonly SchemaGravityZone[];
};
