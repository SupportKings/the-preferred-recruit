"use client";

import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorBubbleMenu } from "./bubbleMenu";

interface TextEditorProps {
	defaultContent?: string;
	onChange?: (content: string) => void;
	placeholder?: string;
	editorRef?: React.MutableRefObject<Editor | null>;
	onSubmit?: () => void;
	editable?: boolean;
}

export function TextEditor({
	defaultContent = "",
	onChange,
	placeholder = "Start typing...",
	editorRef,
	onSubmit,
	editable = true,
}: TextEditorProps) {
	const editor = useEditor({
		immediatelyRender: false,
		editable,
		extensions: [
			StarterKit.configure({
				// StarterKit configuration
			}),
			Placeholder.configure({
				// Use a placeholder:
				placeholder,
				// Use different placeholders depending on the node type:
				// placeholder: ({ node }) => {
				//   if (node.type.name === 'heading') {
				//     return 'What's the title?'
				//   }

				//   return 'Can you add some further context?'
				// },
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Highlight,
		],
		content: defaultContent,
		onUpdate: ({ editor }) => {
			if (onChange) {
				onChange(editor.getHTML());
			}
		},
		editorProps: onSubmit
			? {
					handleKeyDown: (view, event) => {
						// Handle Command+Enter (Mac) or Ctrl+Enter (Windows)
						if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
							event.preventDefault();
							onSubmit();
							return true; // We handled this event
						}
						// For all other keys, let the editor handle them normally
						return false;
					},
					handlePaste: () => {
						// Always return false to let TipTap handle paste events normally
						return false;
					},
				}
			: {},
	});
	//so we can access editor commands from outisde of the component
	useEffect(() => {
		if (editorRef) {
			editorRef.current = editor;
		}
		return () => {
			if (editorRef) {
				editorRef.current = null;
			}
		};
	}, [editor, editorRef]);

	if (!editor) {
		return <Skeleton className="h-32 w-full" />;
	}

	return (
		<div className="w-full">
			{editable && <EditorBubbleMenu editor={editor} />}
			<EditorContent editor={editor} className="!p-0" />
		</div>
	);
}
