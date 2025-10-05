"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { TextEditor } from "@/features/editor/components/editor";

import type { Editor } from "@tiptap/react";
import { motion } from "framer-motion";
import { LoaderIcon, Send } from "lucide-react";

interface CommentInputProps {
	entityId: string;
	entityType: "ticket" | "coach";
	onSubmit: (params: {
		entityId: string;
		comment: string;
		isInternal?: boolean;
	}) => void;
	isPending?: boolean;
	error?: any;
	data?: any;
	placeholder?: string;
}

export function CommentInput({
	entityId,
	entityType,
	onSubmit,
	isPending = false,
	error,
	data,
	placeholder = "Leave a comment...",
}: CommentInputProps) {
	const [comment, setComment] = useState("");
	const [editorKey, setEditorKey] = useState(0);
	const editorRef = useRef<Editor | null>(null);
	const [lastSubmittedComment, setLastSubmittedComment] = useState("");

	const handleSubmit = (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		if (!comment.trim()) return;

		const commentToSubmit = comment.trim();
		setLastSubmittedComment(commentToSubmit);

		// Call the appropriate mutation based on entity type
		if (entityType === "ticket") {
			onSubmit({ entityId, comment: commentToSubmit });
		} else if (entityType === "coach") {
			onSubmit({ entityId, comment: commentToSubmit });
		}
	};

	// Handle successful comment submission
	useEffect(() => {
		if (data?.comment && lastSubmittedComment) {
			// Clear the comment field and remount the editor only on success
			setComment("");
			setEditorKey((prev) => prev + 1);
			setLastSubmittedComment("");
		}
	}, [data, lastSubmittedComment]);

	const handleContainerClick = () => {
		if (editorRef.current) {
			editorRef.current.commands.focus();
		}
	};

	const handleContainerKeyDown = (e: React.KeyboardEvent) => {
		// Only handle keyboard events if the editor is not focused
		if (!editorRef.current?.isFocused && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			handleContainerClick();
		}
	};

	// Handle Command+Enter submission from editor
	const handleEditorSubmit = () => {
		if (comment.trim()) {
			handleSubmit();
		}
	};

	return (
		<motion.div
			layout
			transition={{ duration: 0.25, ease: "easeOut" }}
			initial={false}
		>
			<form onSubmit={handleSubmit} className="mt-4 space-y-2">
				<div
					className="min-h-[80px] cursor-text rounded-md border border-input bg-background px-3 py-2"
					onClick={handleContainerClick}
					onKeyDown={handleContainerKeyDown}
				>
					<TextEditor
						key={editorKey}
						defaultContent=""
						onChange={(content) => setComment(content)}
						placeholder={placeholder}
						editorRef={editorRef}
						onSubmit={handleEditorSubmit}
					/>
				</div>
				{error?._errors && (
					<p className="text-destructive text-sm">{error._errors[0]}</p>
				)}
				<div className="flex justify-end">
					<Button
						type="submit"
						size="sm"
						disabled={isPending || !comment.trim()}
					>
						{isPending ? (
							<>
								<LoaderIcon className="mr-1 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : (
							<>
								<Send className="mr-1 h-4 w-4" />
								Send
							</>
						)}
					</Button>
				</div>
			</form>
		</motion.div>
	);
}
