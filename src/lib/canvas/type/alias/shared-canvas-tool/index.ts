import type { SHARED_CANVAS_TOOL_DEFINITIONS } from '$stylist/canvas/const/record/canvas-tool-definitions';

export type SharedCanvasTool = (typeof SHARED_CANVAS_TOOL_DEFINITIONS)[number]['id'];
