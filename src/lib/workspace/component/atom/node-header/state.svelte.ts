import type { RecipeNodeHeader } from '$stylist/workspace/interface/recipe/node-header';
import type { TokenSize } from '$stylist/theme/type/alias/size';

export function createNodeHeaderState(getProps: () => RecipeNodeHeader) {
	const props = $derived(getProps());
	let isEditing = $state(false);
	const size = $derived((props.size ?? 'md') as TokenSize);
	const selected = $derived(Boolean(props.selected));
	const editable = $derived(props.editable ?? false);
	const showClose = $derived(props.showClose ?? false);
	const showSettings = $derived(props.showSettings ?? false);
	const showDuplicate = $derived(props.showDuplicate ?? false);
	const showDelete = $derived(props.showDelete ?? false);
	const color = $derived(props.color ?? '#2563eb');
	const title = $derived(props.title ?? '');
	let editValue = $state(props.title ?? '');
	const restProps = $derived.by(() => {
		const {
			class: _class,
			id: _id,
			title: _title,
			color: _color,
			size: _size,
			selected: _selected,
			editable: _editable,
			showClose: _showClose,
			showSettings: _showSettings,
			showDuplicate: _showDuplicate,
			showDelete: _showDelete,
			actions: _actions,
			onTitleChange: _onTitleChange,
			onclose: _onclose,
			onsettings: _onsettings,
			onduplicate: _onduplicate,
			ondelete: _ondelete,
			children: _children,
			...rest
		} = props;

		return rest;
	});

	const classes = $derived(
		`node-header node-header--size-${size}${selected ? ' node-header--selected' : ''}`
	);
	const styles = $derived(color ? `--node-header-color: ${color};` : '');

	function handleDoubleClick() {
		if (!props.editable) return;
		isEditing = true;
		editValue = props.title ?? '';
	}

	function commitTitleChange() {
		isEditing = false;
		if (props.onTitleChange && editValue !== title) {
			props.onTitleChange(editValue);
		}
	}

	function handleBlur() {
		commitTitleChange();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			commitTitleChange();
		}

		if (event.key === 'Escape') {
			isEditing = false;
			editValue = title;
		}
	}

	return {
		get size() {
			return size;
		},
		get selected() {
			return selected;
		},
		get editable() {
			return editable;
		},
		get showActions() {
			return showClose || showSettings || showDuplicate || showDelete;
		},
		get title() {
			return title;
		},
		get isEditing() {
			return isEditing;
		},
		get editValue() {
			return editValue;
		},
		set editValue(value: string) {
			editValue = value;
		},
		get color() {
			return color;
		},
		get restProps() {
			return restProps;
		},
		get classes() {
			return classes;
		},
		get styles() {
			return styles;
		},
		handleDoubleClick,
		commitTitleChange,
		handleBlur,
		handleKeydown
	};
}
