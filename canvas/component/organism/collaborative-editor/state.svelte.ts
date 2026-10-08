import { ClassNamesManager } from '$stylist/layout/class/manager/class-names';

import type { RecipeCollaborativeEditor } from '$stylist/canvas/interface/recipe/collaborative-editor';

const Bold = 'bold';
const Italic = 'italic';
const Underline = 'underline';
const AlignLeft = 'align-left';
const AlignCenter = 'align-center';
const AlignRight = 'align-right';
const List = 'list';
const ListOrdered = 'list-ordered';
const MessageCircle = 'message-circle';
const UserIcon = 'user';
const Users = 'users';

export const createCollaborativeEditorState = (getProps: () => RecipeCollaborativeEditor) => {
	const props = $derived(getProps());
	let editorContent = $state(props.content ?? '');
	let editorRef: HTMLDivElement | undefined;

	const showToolbar = $derived(props.showToolbar ?? true);
	const showUserList = $derived(props.showUserList ?? true);
	const users = $derived(props.users ?? []);
	const currentUser = $derived(props.currentUser);

	const containerClasses = $derived(
		ClassNamesManager.merge('c-collaborative-editor', props.class ?? '')
	);

	const toolbarClasses = $derived(
		ClassNamesManager.merge('c-collaborative-editor__toolbar', props.toolbarClass ?? '')
	);

	const editorClasses = $derived(
		ClassNamesManager.merge('c-collaborative-editor__editor', props.editorClass ?? '')
	);

	const userListClasses = $derived(
		ClassNamesManager.merge('c-collaborative-editor__user-list', props.userListClass ?? '')
	);

	const userListHeaderClasses = 'c-collaborative-editor__user-list-header';

	const userListEntryClasses = 'c-collaborative-editor__user-entry';

	const userAvatarClasses = 'c-collaborative-editor__user-avatar';

	const userInitialsClasses = 'c-collaborative-editor__user-initials';

	const userNameClasses = 'c-collaborative-editor__user-name';

	const userIndicatorClasses = 'c-collaborative-editor__user-indicator';

	const toolbarButtonClasses = 'c-collaborative-editor__toolbar-btn';

	const toolbarSeparatorClasses = 'c-collaborative-editor__toolbar-sep';

	function handleInput() {
		props.onContentChange?.(editorContent);
	}

	function handleEditorInput() {
		editorContent = editorRef?.innerHTML ?? '';
	}

	function formatText(command: string) {
		document.execCommand(command, false);
		editorRef?.focus();
	}

	function insertComment() {
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const commentId = `comment-${Date.now()}`;

			const commentMarker = document.createElement('span');
			commentMarker.id = commentId;
			commentMarker.className = 'collaborative-comment-marker';
			commentMarker.textContent = ' ¶';
			commentMarker.style.color = 'blue';
			commentMarker.style.textDecoration = 'underline';
			commentMarker.style.cursor = 'pointer';

			range.insertNode(commentMarker);

			editorContent = editorRef?.innerHTML ?? '';
			props.onContentChange?.(editorContent);
		}
	}

	function handleBlur() {
		handleInput();
	}

	return {
		get editorContent() {
			return editorContent;
		},
		set editorContent(value: string) {
			editorContent = value;
		},
		get showToolbar() {
			return showToolbar;
		},
		get showUserList() {
			return showUserList;
		},
		get users() {
			return users;
		},
		get currentUser() {
			return currentUser;
		},
		get containerClasses() {
			return containerClasses;
		},
		get toolbarClasses() {
			return toolbarClasses;
		},
		get editorClasses() {
			return editorClasses;
		},
		get userListClasses() {
			return userListClasses;
		},
		get userListHeaderClasses() {
			return userListHeaderClasses;
		},
		get userListEntryClasses() {
			return userListEntryClasses;
		},
		get userAvatarClasses() {
			return userAvatarClasses;
		},
		get userInitialsClasses() {
			return userInitialsClasses;
		},
		get userNameClasses() {
			return userNameClasses;
		},
		get userIndicatorClasses() {
			return userIndicatorClasses;
		},
		get toolbarButtonClasses() {
			return toolbarButtonClasses;
		},
		get toolbarSeparatorClasses() {
			return toolbarSeparatorClasses;
		},
		get Bold() {
			return Bold;
		},
		get Italic() {
			return Italic;
		},
		get Underline() {
			return Underline;
		},
		get AlignLeft() {
			return AlignLeft;
		},
		get AlignCenter() {
			return AlignCenter;
		},
		get AlignRight() {
			return AlignRight;
		},
		get List() {
			return List;
		},
		get ListOrdered() {
			return ListOrdered;
		},
		get MessageCircle() {
			return MessageCircle;
		},
		get UserIcon() {
			return UserIcon;
		},
		get Users() {
			return Users;
		},
		set editorRef(value: HTMLDivElement | undefined) {
			editorRef = value;
		},
		get editorRef() {
			return editorRef;
		},
		handleInput,
		handleEditorInput,
		formatText,
		insertComment,
		handleBlur
	};
};

export default createCollaborativeEditorState;
