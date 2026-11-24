/**
 * Role on a lesson board. A `teacher` edits everything and pins objects
 * (`locked`); a `student` cannot select, move or erase pinned objects.
 */
export type CanvasBoardRole = 'teacher' | 'student';
