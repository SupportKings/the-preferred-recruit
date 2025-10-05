"use client";

import { useState } from "react";

export default function CommentBox() {
	const [comment, setComment] = useState("");

	const handleSubmit = () => {
		if (!comment.trim()) return;
		// TODO: Submit comment
		setComment("");
	};

	return (
		<div className="m-0 flex min-w-[min(300px,100%)] grow flex-row rounded-lg border-[0.5px] border-solid bg-[lch(100_0_282.863)] px-4 py-3 align-baseline shadow-[lch(0_0_0_/_0.022)_0_3px_6px_-2px,lch(0_0_0_/_0.044)_0_1px_1px] transition-[border-color] duration-[0.15s] ease-[ease-in-out] [-webkit-box-flex:1]">
			<div className="m-0 flex min-w-0 grow flex-col gap-2 border-0 p-0 align-baseline [-webkit-box-flex:1]">
				<div className="relative m-0 flex w-full min-w-0 flex-1 flex-col border-0 p-0 align-baseline">
					<textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Leave a comment..."
						className="min-h-[100px] w-full resize-none rounded border-none bg-transparent p-2 font-[450] text-[15px] text-[lch(19.643_1_282.863)] leading-6 outline-none placeholder:text-[lch(64.821_1_282.863)]"
					/>
				</div>
				<div className="m-0 flex flex-row items-end justify-end border-0 pt-0 pr-0.5 pb-0.5 pl-0 align-baseline [-webkit-box-pack:end]">
					<div className="m-0 flex grow flex-row-reverse items-center gap-3 border-0 p-0 align-baseline [-webkit-box-align:center] [-webkit-box-flex:1]">
						<div className="m-0 flex gap-2 border-0 p-0 align-baseline [flex-flow:wrap]">
							<div className="m-0 flex flex-row border-0 p-0 align-baseline">
								<button
									className="before:-inset-1.5 relative m-0 inline-flex h-6 w-6 min-w-6 shrink-0 cursor-pointer select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-xl border-[0.5px] border-solid bg-[lch(100_0_282.863)] px-0.5 py-0 align-top font-medium text-[lch(19.643_1_282.863)] text-[lch(64.821_1_282.863)] text-xs shadow-[lch(0_0_0_/_0.022)_0_3px_6px_-2px,lch(0_0_0_/_0.044)_0_1px_1px] transition-[border,background-color,color,opacity] duration-0 [-webkit-box-align:center] [-webkit-box-pack:center] [app-region:no-drag] before:absolute before:content-[''] hover:bg-gray-50 disabled:cursor-default disabled:text-[lch(39.286_1_282.863)] disabled:opacity-60"
									onClick={handleSubmit}
									disabled={!comment.trim()}
									aria-label="Submit comment"
								>
									<span
										className="m-0 inline-flex max-h-4 max-w-4 items-center justify-center border-0 p-0 align-baseline transition-[fill,stroke] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center]"
										aria-hidden="true"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
											role="img"
											fill="currentColor"
											viewBox="0 0 16 16"
											height="16"
											width="16"
										>
											<path d="M11.48 5.674a.75.75 0 1 1-.96 1.152L8.75 5.351v6.899a.75.75 0 0 1-1.5 0V5.351L5.48 6.826a.75.75 0 0 1-.96-1.152l3-2.5a.75.75 0 0 1 .96 0l3 2.5Z" />
										</svg>
									</span>
								</button>
							</div>
						</div>
						<div className="m-0 flex flex-row border-0 p-0 align-baseline transition-[visibility] delay-[0.3s] duration-[linear,opacity]">
							<button
								type="button"
								className="relative m-0 inline-flex h-6 min-w-6 shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-[100%] border-[0.5px] border-transparent border-solid bg-transparent px-0.5 py-0 align-top font-medium text-[lch(19.643_1_282.863)] text-[lch(64.821_1_282.863)] text-xs shadow-none transition-[border,background-color,color,opacity] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center] [app-region:no-drag] hover:bg-gray-50 disabled:cursor-default disabled:opacity-60"
								aria-label="Attach images, files or videos"
								tabIndex={-1}
							>
								<span
									className="m-0 inline-flex max-h-4 max-w-4 items-center justify-center border-0 p-0 align-baseline transition-[fill,stroke] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center]"
									aria-hidden="true"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
										role="img"
										fill="currentColor"
										viewBox="0 0 16 16"
										height="16"
										width="16"
									>
										<path d="M12.6429 7.69048L8.92925 11.4041C7.48164 12.8517 5.34347 13.0101 4.16667 11.8333C2.98733 10.654 3.14447 8.52219 4.59216 7.07451L8.00206 3.66461C8.93557 2.73109 10.2976 2.63095 11.0333 3.36667C11.7681 4.10139 11.6658 5.4675 10.7361 6.39727L7.32363 9.8097C6.90202 10.2313 6.32171 10.2741 6.02381 9.97619C5.72651 9.6789 5.76949 9.09718 6.1989 8.66776L9.29048 5.57619C9.56662 5.30005 9.56662 4.85233 9.29048 4.57619C9.01433 4.30005 8.56662 4.30005 8.29048 4.57619L5.1989 7.66776C4.24737 8.6193 4.13865 10.091 5.02381 10.9762C5.9095 11.8619 7.37984 11.7535 8.32363 10.8097L11.7361 7.39727C13.1876 5.94573 13.3564 3.68975 12.0333 2.36667C10.7099 1.04326 8.45782 1.20884 7.00206 2.66461L3.59216 6.07451C1.62229 8.04437 1.39955 11.0662 3.16667 12.8333C4.93146 14.5981 7.9596 14.3737 9.92925 12.4041L13.6429 8.69048C13.919 8.41433 13.919 7.96662 13.6429 7.69048C13.3667 7.41433 12.919 7.41433 12.6429 7.69048Z" />
									</svg>
								</span>
							</button>
						</div>
						<input className="invisible hidden" type="file" />
					</div>
				</div>
			</div>
		</div>
	);
}
