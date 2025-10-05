"use client";

import { Toggle } from "@base-ui-components/react/toggle";
import { ToggleGroup } from "@base-ui-components/react/toggle-group";
import { Toolbar } from "@base-ui-components/react/toolbar";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

interface EditorBubbleMenuProps {
	editor: Editor | null;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
	if (!editor) {
		return null;
	}

	return (
		<BubbleMenu editor={editor} updateDelay={0} resizeDelay={0}>
			<Toolbar.Root className="flex w-fit items-center gap-px rounded-md border border-gray-200 bg-gray-50 p-0.5">
				<ToggleGroup className="flex gap-1" aria-label="Headings">
					<Toolbar.Button
						render={<Toggle />}
						onClick={() =>
							editor.chain().focus().toggleHeading({ level: 1 }).run()
						}
						value="h1"
						className="focus-visible:-outline-offset-1 flex h-8 select-none items-center justify-center rounded-sm px-[0.75rem] font-[inherit] font-medium text-gray-600 text-sm hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
						aria-label="Heading 1"
						data-pressed={editor.isActive("heading", { level: 1 }) || undefined}
					>
						H1
					</Toolbar.Button>
					<Toolbar.Button
						render={<Toggle />}
						onClick={() =>
							editor.chain().focus().toggleHeading({ level: 2 }).run()
						}
						value="h2"
						className="focus-visible:-outline-offset-1 flex h-8 select-none items-center justify-center rounded-sm px-[0.75rem] font-[inherit] font-medium text-gray-600 text-sm hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
						aria-label="Heading 2"
						data-pressed={editor.isActive("heading", { level: 2 }) || undefined}
					>
						H2
					</Toolbar.Button>
					<Toolbar.Button
						render={<Toggle />}
						onClick={() =>
							editor.chain().focus().toggleHeading({ level: 3 }).run()
						}
						value="h3"
						className="focus-visible:-outline-offset-1 flex h-8 select-none items-center justify-center rounded-sm px-[0.75rem] font-[inherit] font-medium text-gray-600 text-sm hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
						aria-label="Heading 3"
						data-pressed={editor.isActive("heading", { level: 3 }) || undefined}
					>
						H3
					</Toolbar.Button>
				</ToggleGroup>
				<Toolbar.Separator className="m-1 h-4 w-px bg-gray-300" />
				<ToggleGroup className="flex gap-1" aria-label="Text formatting">
					<Toolbar.Button
						render={<Toggle />}
						onClick={() => editor.chain().focus().toggleBold().run()}
						value="bold"
						className="focus-visible:-outline-offset-1 flex h-8 select-none items-center justify-center rounded-sm px-[0.75rem] font-[inherit] font-bold text-gray-600 text-sm hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
						aria-label="Bold"
						data-pressed={editor.isActive("bold") || undefined}
					>
						B
					</Toolbar.Button>
					<Toolbar.Button
						render={<Toggle />}
						onClick={() => editor.chain().focus().toggleItalic().run()}
						value="italic"
						className="focus-visible:-outline-offset-1 flex h-8 select-none items-center justify-center rounded-sm px-[0.75rem] font-[inherit] text-gray-600 text-sm italic hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
						aria-label="Italic"
						data-pressed={editor.isActive("italic") || undefined}
					>
						I
					</Toolbar.Button>
					<Toolbar.Button
						render={<Toggle />}
						onClick={() => editor.chain().focus().toggleStrike().run()}
						value="strike"
						className="focus-visible:-outline-offset-1 flex h-8 select-none items-center justify-center rounded-sm px-[0.75rem] font-[inherit] text-gray-600 text-sm line-through hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
						aria-label="Strikethrough"
						data-pressed={editor.isActive("strike") || undefined}
					>
						S
					</Toolbar.Button>
					<Toolbar.Button
						render={<Toggle />}
						onClick={() => editor.chain().focus().toggleHighlight().run()}
						value="highlight"
						className="focus-visible:-outline-offset-1 flex h-8 select-none items-center justify-center rounded-sm px-[0.75rem] font-[inherit] font-medium text-gray-600 text-sm hover:bg-gray-100 focus-visible:bg-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200 data-[pressed]:bg-gray-100 data-[pressed]:text-gray-900"
						aria-label="Highlight"
						data-pressed={editor.isActive("highlight") || undefined}
					>
						H
					</Toolbar.Button>
				</ToggleGroup>
			</Toolbar.Root>
		</BubbleMenu>
	);
}
