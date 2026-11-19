# ERD layout and relation routing

`Schema` and `SchemaView` accept `layout="clusters"`, an optional
`clusterAspectRatio`, and `tableGroups: Readonly<Record<string,string>>` mapping
table names to semantic group labels. Tables without an explicit label use
their name prefix. Groups are ordered by foreign-key connection strength;
connected tables are placed together within each group. Headers can drag a
whole group, while individual cards remain independently draggable.

`leadingCluster` reserves a dedicated left column for the named reference group.
Every other group is tiled strictly to its right; the reference block uses at
most two table columns. The layout identity includes this choice so previously
saved positions do not override a changed reference-group arrangement.

`function/create/schema-dependency-routes` creates orthogonal routes around
table rectangles and reserved group-header areas. Every relation exits the right
side of its source field and enters the left side of its target field, including
reverse and self references. It first finds legal obstacle-free corridors. Local segment gravity
then attracts overlapping parallel sections into shared trunks, with a finite
attraction radius, damped steps and obstacle collision checks. Sections can move
independently; field endpoints remain fixed. The result recalculates when cards
move and does not require a continuously running physics simulation.

Relations to the same target field reserve a common incoming spine before their
branches are routed. They therefore share an actual final section rather than
only converging approximately. The join, incoming corner and field endpoint stay
fixed during gravity relaxation, including inside local boost zones. Shorter
spines are tried when nearby obstacles restrict the available space; separate
approaches remain possible when no clear shared spine exists.
Branches also prefer lanes already used by relations to that same field, so
they can merge earlier along their route instead of repelling one another.

The floating **Gravity** panel changes the global attraction radius and strength.
Its local boost zones have independent radii and strengths; add them at the
viewport centre, then drag their numbered handles onto the desired area. The
zones are visible while the panel is open. Settings are stored in browser
localStorage per schema/layout; Reset gravity restores defaults and removes the
zones. `gravity` in the schema settings supplies optional initial defaults.
Global strength is the baseline; zone strength adds a local boost with a smooth
falloff toward the zone boundary. Setting global strength to zero leaves only
the local boosts; setting the attraction radius to zero disables attraction.
No settings are written to the application database.

`function/transform/bundle-schema-dependency-routes` performs this deterministic
relaxation without mutating its input. `function/serialize/schema-route-path`
rounds the elbows for smooth merging and branching. Routes retain an eight-pixel
obstacle margin; the quadratic corners deviate at most six pixels from their
orthogonal spines. The external result contains SVG `pathData` and the underlying
polyline points, with field-level endpoints preserved. Invalid references and
cards manually overlapping so tightly that no legal exit remains have no route.

`SchemaDependency` accepts optional `pathData`; standalone uses without that
property retain their directional curve. Hovering or selecting a table
highlights its immediate relations and dims unrelated paths.

The unit suite checks obstacles, group headers, reverse/self references, narrow
corridors, dragging, deterministic output, local attraction, obstacle barriers,
rounded paths and a 96-table graph. The existing
localization render suite checks the parser, header and controls.

New standalone entities need `yarn stylist:index` from the workspace root to
refresh generated exports. The new SchemaGravity component and its story also
need `yarn stylist:manifest` for sandbox discovery (that command includes indexes).
Direct source imports already work in portal
consumers; generation and package publication are separate steps.
