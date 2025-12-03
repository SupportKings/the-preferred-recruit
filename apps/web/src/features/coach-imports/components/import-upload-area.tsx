"use client";

import { useCallback, useState } from "react";

import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useAction } from "next-safe-action/hooks";
import { uploadImportFileAction } from "../actions/uploadImportFile";

interface ImportUploadAreaProps {
	onUploadSuccess?: (jobId: string) => void;
}

export function ImportUploadArea({ onUploadSuccess }: ImportUploadAreaProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const { execute } = useAction(uploadImportFileAction, {
		onSuccess: (result) => {
			if (result.data?.success && result.data?.data?.jobId) {
				setIsUploading(false);
				setUploadError(null);
				if (onUploadSuccess) {
					onUploadSuccess(result.data.data.jobId);
				}
			} else if (result.data?.error) {
				setIsUploading(false);
				setUploadError(result.data.error);
			}
		},
		onError: (error) => {
			console.error("Upload failed:", error);
			setIsUploading(false);
			setUploadError("Upload failed. Please try again.");
		},
	});

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (!file) return;

			setIsUploading(true);
			setUploadError(null);

			const formData = new FormData();
			formData.append("file", file);

			execute(formData);
		},
		[execute],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
				".xlsx",
			],
			"application/vnd.ms-excel": [".xls"],
			"text/csv": [".csv"],
		},
		maxFiles: 1,
		maxSize: 50 * 1024 * 1024, // 50MB
		disabled: isUploading,
	});

	return (
		<Card className="border-2 border-dashed">
			<div
				{...getRootProps()}
				className={`cursor-pointer p-12 text-center transition-colors ${
					isDragActive
						? "bg-accent/50"
						: "bg-background hover:bg-accent/20"
				} ${isUploading ? "pointer-events-none opacity-50" : ""}`}
			>
				<input {...getInputProps()} />
				<div className="flex flex-col items-center gap-4">
					<div className="rounded-full bg-primary/10 p-4">
						<Upload className="h-8 w-8 text-primary" />
					</div>
					<div>
						<p className="text-lg font-medium">
							{isDragActive
								? "Drop your file here"
								: "Drag & drop your Excel file here"}
						</p>
						<p className="text-sm text-muted-foreground">
							or click to browse
						</p>
					</div>
					<div className="text-xs text-muted-foreground">
						Accepted formats: .xlsx, .xls, .csv
						<br />
						Maximum file size: 50MB
					</div>
					{isUploading && (
						<div className="text-sm font-medium text-primary">
							Uploading...
						</div>
					)}
					{uploadError && (
						<div className="text-sm font-medium text-destructive">
							{uploadError}
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}
