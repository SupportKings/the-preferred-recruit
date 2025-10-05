"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";

import { siteConfig } from "@/siteConfig";

import { useForm } from "@tanstack/react-form";
import { AnimatePresence, motion as m } from "framer-motion";
import { Key, Loader } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

const emailSchema = z.object({
	email: z.string().email("Invalid email address"),
});

interface SignInFormProps {
	redirectTo?: string;
}

export function SignInForm({ redirectTo = "/" }: SignInFormProps) {
	const [step, setStep] = useState<"email" | "otp">("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
	const [passkeyResolved, setPasskeyResolved] = useState(false);

	const [resendDisabled, setResendDisabled] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [emailError, setEmailError] = useState<string | React.ReactElement>("");
	const [submissionType, setSubmissionType] = useState<"email" | "passkey">(
		"email",
	);
	const router = useRouter();

	// Handle passkey cancellation detection
	useEffect(() => {
		if (!isPasskeyLoading) return;

		let timeoutId: NodeJS.Timeout;

		const checkForCancellation = () => {
			// Clear any existing timeout
			if (timeoutId) clearTimeout(timeoutId);

			// Set a new timeout - longer delay to avoid false positives
			timeoutId = setTimeout(() => {
				// Only show cancellation if we're still loading AND haven't resolved
				if (isPasskeyLoading && !passkeyResolved) {
					setIsPasskeyLoading(false);
					toast.error("Passkey authentication was cancelled");
				}
			}, 1000); // 1 second delay to ensure it's actually cancelled
		};

		const handleFocus = () => {
			checkForCancellation();
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				checkForCancellation();
			}
		};

		window.addEventListener("focus", handleFocus);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			window.removeEventListener("focus", handleFocus);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [isPasskeyLoading, passkeyResolved]);

	const emailForm = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			setEmailError(""); // Clear any previous errors

			if (submissionType === "passkey") {
				// Handle passkey authentication
				setIsPasskeyLoading(true);
				setPasskeyResolved(false); // Reset resolution state
				try {
					await authClient.signIn.passkey(
						{
							email: value.email,
						},
						{
							onSuccess: () => {
								setPasskeyResolved(true); // Mark as resolved
								// We wrap our navigate in a setTimeout 0. This forces the code to run on the next tick,
								// which protects us against some edge cases where you are signed in but the cookie isn't set yet
								// causing you to bounce between routes over and over.
								setTimeout(() => {
									router.push(redirectTo);
								}, 0);
							},
							onError: (error) => {
								setPasskeyResolved(true); // Mark as resolved
								toast.error(error.error.message || "Passkey sign-in failed");
								setIsPasskeyLoading(false); // Only stop loading on error
							},
						},
					);
				} catch (error: any) {
					console.error("Passkey sign-in error:", error);
					setPasskeyResolved(true); // Mark as resolved
					toast.error("Passkey sign-in failed. Please try again.");
					setIsPasskeyLoading(false);
				}
				return;
			}

			// Handle email OTP authentication
			setIsLoading(true);
			try {
				await authClient.emailOtp.sendVerificationOtp(
					{
						email: value.email,
						type: "sign-in",
					},
					{
						onSuccess: () => {
							setEmail(value.email);
							setStep("otp");
							setResendDisabled(true);
							setCountdown(30);
						},
						onError: (error) => {
							// Handle the case where user doesn't exist (Better Auth beta throws USER_NOT_FOUND)
							console.log("error", error);
							if (error.error.code === "USER_NOT_FOUND") {
								setEmail(value.email);
								setStep("otp");
								setResendDisabled(true);
								setCountdown(30);
							} else {
								setEmailError(
									error.error.message || "Failed to send verification code",
								);
							}
						},
					},
				);
			} finally {
				setIsLoading(false);
			}
		},
		validators: {
			onSubmit: emailSchema,
		},
	});

	const handleVerifyOtp = async () => {
		if (!otp || otp.length !== 6) {
			return;
		}

		setIsLoading(true);
		try {
			await authClient.signIn.emailOtp(
				{
					email: email,
					otp: otp,
				},
				{
					onSuccess: () => {
						// We wrap our navigate in a setTimeout 0. This forces the code to run on the next tick,
						// which protects us against some edge cases where you are signed in but the cookie isn't set yet
						// causing you to bounce between routes over and over.
						// https://x.com/IzakFilmalter/status/1929865024366948690
						setTimeout(() => {
							router.push(redirectTo);
						}, 0);
						// Don't set isLoading to false here - keep the loading state during redirect
						/*             toast.success("Sign in successful");
						 */
					},
					onError: (error) => {
						toast.error(error.error.message || "Invalid code");
						setIsLoading(false); // Only stop loading on error
					},
				},
			);
		} catch (error: any) {
			toast.error(error?.message || "Failed to verify code");
			setIsLoading(false); // Only stop loading on error
		}
	};

	const handleResendCode = async () => {
		setIsLoading(true);
		try {
			await authClient.emailOtp.sendVerificationOtp({
				email: email,
				type: "sign-in",
			});
			setResendDisabled(true);
			setCountdown(30);
		} catch (error: any) {
			toast.error(error?.message || "Failed to resend code");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasskeySignIn = () => {
		setSubmissionType("passkey");
		void emailForm.handleSubmit();
	};

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
		setResendDisabled(false);
	}, [countdown]);

	const commonButtonClassName =
		"inline-flex align-top items-center justify-center whitespace-nowrap shrink-0 font-medium select-none relative border border-neutral-300 shadow-[rgba(0,0,0,0.02)_0_4px_4px_-1px,rgba(0,0,0,0.06)_0_1px_1px_0] bg-white text-[#2f2f31] min-w-8 h-[42px] text-[13px] w-full px-3.5 py-0 rounded-[5px] disabled:opacity-60 disabled:text-[#5c5c5e] hover:bg-[rgb(247_247_247)] transition duration-150 dark:bg-[#1e2025] dark:text-[#e3e4e6] dark:border-[#2c2e33] dark:hover:bg-[#1e2025]";

	return (
		<div className="m-0 flex min-h-screen flex-auto shrink-0 flex-col border-0 bg-white p-0 align-baseline transition-colors duration-300 dark:bg-[#0f1011]">
			<div className="flex flex-1 flex-col">
				<div
					className="mx-auto flex flex-col items-center border-0 p-0 align-baseline [-webkit-box-align:center]"
					style={{ marginTop: "calc(50vh - 200px)" }}
				>
					<div className="w-[336px]">
						{/* Logo */}
						<div className="mb-[32px] flex justify-center">
							<Logo width={80} height={80} />
						</div>

						{/* Title */}
						<span className="block text-center font-medium text-[#2F2F31] text-[22px] leading-8 tracking-[-0.01rem] dark:text-[#e3e4e6]">
							Welcome to {siteConfig.name}
						</span>
						<span className="mb-[25px] block text-center font-normal text-[#2F2F31] text-sm leading-8 tracking-[-0.01rem] dark:text-[#e3e4e6]">
							Sign in with your email
						</span>

						<AnimatePresence mode="wait" initial={false}>
							{step === "email" && (
								<m.div
									key="email"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15, ease: "easeInOut" }}
									className="mt-[25px] space-y-4"
								>
									<form
										onSubmit={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setSubmissionType("email");
											void emailForm.handleSubmit();
										}}
										className="space-y-4"
									>
										<emailForm.Field name="email">
											{(field) => (
												<div className="space-y-1.5">
													<Label
														htmlFor={field.name}
														className="font-medium text-[#2F2F31] text-[13px] dark:text-[#e3e4e6]"
													>
														Email
													</Label>
													<input
														id={field.name}
														name={field.name}
														type="email"
														// biome-ignore lint/a11y/noAutofocus: <fuck accessibility>
														autoFocus={true}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														placeholder="Enter your email"
														autoComplete="username webauthn"
														className={`-outline-offset-1 m-0 h-[36px] w-full appearance-none rounded-[5px] border border-solid px-3 py-1.5 text-[#1b1b1b] text-base transition-[border] duration-[0.15s] [app-region:no-drag] [background:#fbfbfb] placeholder:text-[#9d9d9f] focus:outline-none focus:ring-0 disabled:text-[#5c5c5e] sm:text-[0.8125rem] dark:border-[#2c2e33] dark:bg-[#0f1011] dark:text-white dark:disabled:text-[#969799] dark:placeholder:text-[#48494A] ${
															field.state.meta.errors.length > 0 || emailError
																? "border-red-500 hover:border-red-500 focus:border-red-500"
																: "border-neutral-300 hover:border-[rgb(189_189_189)] focus:border-[rgb(189_189_189)] dark:focus:border-[rgb(58,63,76)] dark:hover:border-[rgb(58,63,76)]"
														}`}
													/>
													{field.state.meta.errors.map((error) => (
														<p
															key={error?.message}
															className="text-red-500 text-sm"
														>
															{error?.message}
														</p>
													))}
													{emailError && (
														<p className="text-red-500 text-sm">{emailError}</p>
													)}
												</div>
											)}
										</emailForm.Field>

										<emailForm.Subscribe>
											{(state) => (
												<div className="">
													<Button
														type="submit"
														className={commonButtonClassName}
														disabled={
															(state.isSubmitting &&
																submissionType === "email") ||
															isLoading ||
															isPasskeyLoading
														}
													>
														{(state.isSubmitting &&
															submissionType === "email") ||
														isLoading ? (
															<Loader className="size-4 animate-spin" />
														) : (
															"Send Code"
														)}
													</Button>
													<div className="relative my-2">
														<div className="absolute inset-0 flex items-center">
															<span className="w-full border-neutral-300 border-t dark:border-[#2c2e33]" />
														</div>
														<div className="relative flex justify-center text-xs uppercase">
															<span className="bg-white px-2 text-[#5c5c5e] text-[13px] dark:bg-[#0f1011] dark:text-[#969799]">
																OR
															</span>
														</div>
													</div>
													<Button
														type="button"
														onClick={handlePasskeySignIn}
														disabled={
															isPasskeyLoading ||
															(state.isSubmitting &&
																submissionType === "passkey")
														}
														className={`${commonButtonClassName} flex items-center`}
													>
														{isPasskeyLoading ||
														(state.isSubmitting &&
															submissionType === "passkey") ? (
															<Loader className="size-4 animate-spin" />
														) : (
															<Key className="size-4" />
														)}
														{isPasskeyLoading ||
														(state.isSubmitting && submissionType === "passkey")
															? ""
															: "Passkey"}
													</Button>
												</div>
											)}
										</emailForm.Subscribe>
									</form>
								</m.div>
							)}

							{step === "otp" && (
								<m.div
									key="otp"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15, ease: "easeInOut" }}
									className="mt-[25px] space-y-6"
								>
									<div className="space-y-2">
										<p className="text-center text-[#2F2F31] text-[13px] dark:text-[#e3e4e6]">
											We sent a code to{" "}
											<span className="font-medium">{email}</span>
										</p>
										<p className="text-center text-[#5c5c5e] text-[13px] dark:text-[#969799]">
											Enter the 6-digit code below. Check your spam folder as
											well.
										</p>
									</div>

									<div className="space-y-4">
										<div className="flex justify-center">
											<InputOTP
												maxLength={6}
												value={otp}
												onChange={setOtp}
												autoFocus
												onComplete={handleVerifyOtp}
											>
												<InputOTPGroup className="">
													<InputOTPSlot
														index={0}
														className="border-neutral-300 text-lg dark:border-[#2c2e33] dark:bg-[#0f1011] dark:text-white"
													/>
													<InputOTPSlot
														index={1}
														className="border-neutral-300 text-lg dark:border-[#2c2e33] dark:bg-[#0f1011] dark:text-white"
													/>
													<InputOTPSlot
														index={2}
														className="border-neutral-300 text-lg dark:border-[#2c2e33] dark:bg-[#0f1011] dark:text-white"
													/>
													<InputOTPSlot
														index={3}
														className="border-neutral-300 text-lg dark:border-[#2c2e33] dark:bg-[#0f1011] dark:text-white"
													/>
													<InputOTPSlot
														index={4}
														className="border-neutral-300 text-lg dark:border-[#2c2e33] dark:bg-[#0f1011] dark:text-white"
													/>
													<InputOTPSlot
														index={5}
														className="border-neutral-300 text-lg dark:border-[#2c2e33] dark:bg-[#0f1011] dark:text-white"
													/>
												</InputOTPGroup>
											</InputOTP>
										</div>

										<Button
											type="button"
											onClick={handleVerifyOtp}
											disabled={isLoading || otp.length !== 6}
											className={commonButtonClassName}
										>
											{isLoading ? (
												<Loader className="size-4 animate-spin" />
											) : (
												"Verify Code"
											)}
										</Button>

										<Button
											type="button"
											disabled={resendDisabled || isLoading}
											onClick={handleResendCode}
											className="mx-auto mt-4 block text-[#5c5c5e] text-[13px] no-underline transition-colors duration-200 hover:text-[#2f2f31] hover:no-underline dark:text-[#969799] dark:hover:text-[rgb(227_228_230)]"
											variant="link"
										>
											{resendDisabled
												? `Resend code in ${countdown}s`
												: "Resend code"}
										</Button>
									</div>
								</m.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
}
