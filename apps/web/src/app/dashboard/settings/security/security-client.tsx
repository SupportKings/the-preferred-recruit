"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import { Skeleton } from "@/components/ui/skeleton";

import { AddPasskeyDialog } from "@/features/auth/components/add-passkey-dialog";
import type { Session } from "@/features/security/queries/getSessions";
import { usePasskeys } from "@/features/security/queries/usePasskeys";
import { useSessions } from "@/features/security/queries/useSessions";

import { useUser } from "@/queries/useUser";

import NumberFlow from "@number-flow/react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Key } from "lucide-react";
import { toast } from "sonner";

export default function SecurityClient() {
	const { data: sessions, isLoading: sessionsLoading } = useSessions();
	const { data: currentUser, isLoading: userLoading } = useUser();
	const queryClient = useQueryClient();
	const [revokingToken, setRevokingToken] = useState<string | null>(null);
	const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(
		null,
	);

	const { data: passkeys, isLoading: passkeysLoading } = usePasskeys();

	if (sessionsLoading || userLoading) {
		return (
			<div className="mt-12 flex justify-center">
				<div className="w-full max-w-2xl">
					<div className="m-0 flex scroll-mt-8 flex-col gap-4 border-0 p-0 align-baseline opacity-100">
						<div className="m-0 flex flex-row items-center justify-between gap-4 border-0 p-0 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
							<div className="m-0 flex grow flex-col gap-0.5 border-0 p-0 align-baseline [-webkit-box-flex:1]">
								<div className="m-0 flex flex-row items-center gap-1 border-0 p-0 align-baseline [-webkit-box-align:center]">
									<Skeleton className="h-6 w-16" />
								</div>
								<Skeleton className="h-4 w-48" />
							</div>
						</div>
						<div className="m-0 flex flex-col gap-3 border-0 p-0 align-baseline">
							{/* Current session skeleton */}
							<section className="m-0 block rounded-[7px] border-[0.5px] border-solid bg-[lch(100_0_282.863)] p-0 align-baseline empty:hidden dark:bg-[lch(8.3_1.867_272)]">
								<ul className="mx-0 mt-[0.8em] mb-[1.2em] border-0 p-0 align-baseline [list-style:none]">
									<li className="relative m-0 flex min-h-[60px] items-center justify-between gap-4 rounded-md border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
										<div className="m-0 flex flex-row items-center gap-4 border-0 p-0 align-baseline [-webkit-box-align:center]">
											<Skeleton className="h-8 w-8 shrink-0 rounded-md" />
											<div className="m-0 flex flex-col gap-0.5 border-0 p-0 align-baseline">
												<Skeleton className="h-4 w-32" />
												<div className="flex items-center gap-2">
													<Skeleton className="h-3 w-20" />
													<Skeleton className="h-3 w-24" />
												</div>
											</div>
										</div>
									</li>
								</ul>
							</section>

							{/* Other sessions skeleton */}
							<div className="m-0 flex scroll-mt-8 flex-col gap-4 border-0 p-0 align-baseline opacity-100">
								<div className="m-0 flex flex-col gap-3 border-0 p-0 align-baseline">
									<section className="m-0 block rounded-[7px] border-[0.5px] border-solid bg-[lch(100_0_282.863)] p-0 align-baseline empty:hidden dark:bg-[lch(8.3_1.867_272)]">
										<header className="m-0 flex min-h-[60px] items-center justify-between gap-4 border-0 border-b-[0.5px] border-solid px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
											<div className="m-0 flex flex-col gap-0.5 border-0 p-0 align-baseline opacity-100">
												<Skeleton className="h-4 w-24" />
											</div>
										</header>
										<ul className="mx-0 mt-[0.8em] mb-[1.2em] border-0 p-0 align-baseline [list-style:none]">
											{[...Array(3)].map((_, i) => (
												<li
													key={`skeleton-session-item-${i}`}
													className="relative m-0 flex min-h-[60px] items-center justify-between gap-4 border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]"
												>
													<div className="m-0 flex flex-row items-center gap-4 border-0 p-0 align-baseline [-webkit-box-align:center]">
														<Skeleton className="h-8 w-8 shrink-0 rounded-md" />
														<div className="m-0 flex flex-col gap-0.5 border-0 p-0 align-baseline">
															<Skeleton className="h-4 w-36" />
															<div className="flex items-center gap-2">
																<Skeleton className="h-3 w-16" />
																<Skeleton className="h-3 w-28" />
															</div>
														</div>
													</div>
													<Skeleton className="h-8 w-16 rounded-[5px]" />
												</li>
											))}
										</ul>
									</section>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!sessions || sessions.length === 0) {
		return <div>No active sessions found.</div>;
	}

	// Separate current session from other sessions
	const currentSessionData = sessions.find(
		(session) => session.id === currentUser?.session?.id,
	);
	const otherSessions = sessions.filter(
		(session) => session.id !== currentUser?.session?.id,
	);

	const getDeviceInfo = (userAgent?: string | null) => {
		if (!userAgent) return { device: "Unknown Device", icon: "desktop" };

		const ua = userAgent.toLowerCase();
		if (
			ua.includes("mobile") ||
			ua.includes("iphone") ||
			ua.includes("android")
		) {
			return { device: "Mobile", icon: "mobile" };
		}
		return { device: "Desktop", icon: "desktop" };
	};

	const getBrowserInfo = (userAgent?: string | null) => {
		if (!userAgent) return "Unknown Browser";

		const ua = userAgent.toLowerCase();
		if (ua.includes("brave")) return "Brave";
		if (ua.includes("chrome")) return "Chrome";
		if (ua.includes("firefox")) return "Firefox";
		if (ua.includes("safari")) return "Safari";
		if (ua.includes("edge")) return "Edge";
		if (ua.includes("arc")) return "Arc";
		return "Unknown Browser";
	};

	const getOSInfo = (userAgent?: string | null) => {
		if (!userAgent) return "Unknown OS";

		const ua = userAgent.toLowerCase();
		if (ua.includes("mac")) return "macOS";
		if (ua.includes("windows")) return "Windows";
		if (ua.includes("linux")) return "Linux";
		if (ua.includes("ios")) return "iOS";
		if (ua.includes("android")) return "Android";
		return "Unknown OS";
	};

	const formatSessionInfo = (session: Session) => {
		const { device, icon } = getDeviceInfo(session.userAgent);
		const browser = getBrowserInfo(session.userAgent);
		const os = getOSInfo(session.userAgent);

		return {
			name: `${browser} on ${os}`,
			device,
			icon,
			location: session.ipAddress || "Unknown location",
			lastSeen: session.updatedAt
				? formatDistanceToNow(session.updatedAt, { addSuffix: true })
				: "Unknown",
		};
	};

	const handleRevokeSession = async (token: string) => {
		setRevokingToken(token);
		try {
			await authClient.revokeSession({ token });
			// Invalidate sessions query to refetch data
			queryClient.invalidateQueries({ queryKey: ["sessions"] });
		} catch (error) {
			console.error("Failed to revoke session:", error);
		} finally {
			setRevokingToken(null);
		}
	};

	const handleDeletePasskey = async (passkeyId: string) => {
		setDeletingPasskeyId(passkeyId);

		await authClient.passkey.deletePasskey(
			{
				id: passkeyId,
			},
			{
				onSuccess: () => {
					toast.success("Passkey deleted successfully");
					queryClient.invalidateQueries({ queryKey: ["passkeys"] });
					setDeletingPasskeyId(null);
				},
				onError: (error) => {
					console.error("Error deleting passkey:", error);
					toast.error(error.error?.message || "Failed to delete passkey");
					setDeletingPasskeyId(null);
				},
			},
		);
	};

	const getDeviceIcon = (deviceType: string) => {
		switch (deviceType) {
			case "mobile":
				return (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						role="img"
						fill="lch(39.286% 1 282.863 / 1)"
						viewBox="0 0 16 16"
						height="16"
						width="16"
						className=""
					>
						<path
							d="M10 2.5H10.5C11.0523 2.5 11.5 2.94772 11.5 3.5V12.5C11.5 13.0523 11.0523 13.5 10.5 13.5H5.5C4.94772 13.5 4.5 13.0523 4.5 12.5V3.5C4.5 2.94772 4.94772 2.5 5.5 2.5H6V3C6 3.55228 6.44772 4 7 4H9C9.55228 4 10 3.55228 10 3V2.5ZM3 3.5C3 2.11929 4.11929 1 5.5 1H10.5C11.8807 1 13 2.11929 13 3.5V12.5C13 13.8807 11.8807 15 10.5 15H5.5C4.11929 15 3 13.8807 3 12.5V3.5Z"
							clip-rule="evenodd"
							fill-rule="evenodd"
						/>
					</svg>
				);
			case "desktop":
			default:
				return (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						role="img"
						fill="lch(39.286% 1 282.863 / 1)"
						viewBox="0 0 16 16"
						height="16"
						width="16"
						className=""
					>
						<path
							d="M3 2.5H13C13.2761 2.5 13.5 2.72386 13.5 3V9C13.5 9.27614 13.2761 9.5 13 9.5H3C2.72386 9.5 2.5 9.27614 2.5 9V3C2.5 2.72386 2.72386 2.5 3 2.5ZM1 3C1 1.89543 1.89543 1 3 1H13C14.1046 1 15 1.89543 15 3V9C15 10.1046 14.1046 11 13 11H3C1.89543 11 1 10.1046 1 9V3ZM7 12H9V13C9 13.2761 9.22386 13.5 9.5 13.5C10.3284 13.5 11 14.1716 11 15H5C5 14.1716 5.67157 13.5 6.5 13.5C6.77614 13.5 7 13.2761 7 13V12Z"
							clip-rule="evenodd"
							fill-rule="evenodd"
						/>
					</svg>
				);
		}
	};

	return (
		<div className="mt-12 flex justify-center">
			<div className="w-full max-w-2xl">
				<div className="m-0 flex scroll-mt-8 flex-col gap-4 border-0 p-0 align-baseline opacity-100">
					<div className="m-0 flex flex-row items-center justify-between gap-4 border-0 p-0 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
						<div className="m-0 flex grow flex-col gap-0.5 border-0 p-0 align-baseline [-webkit-box-flex:1]">
							<div className="m-0 flex flex-row items-center gap-1 border-0 p-0 align-baseline [-webkit-box-align:center]">
								<h3 className="m-0 block border-0 p-0 text-left align-baseline font-[450] text-[15px] text-[lch(9.723_0_282.863)] leading-[1.4375rem] dark:text-[lch(100_0_272)]">
									Sessions
								</h3>
							</div>
							<div className="cHuGaL m-0 border-0 p-0 text-left align-baseline font-[450] text-[13px] text-[lch(38.893_1_282.863)] leading-[22px] dark:text-[lch(62.6_1.35_272)]">
								Devices logged into your account
							</div>
						</div>
						<div />
					</div>
					<div className="m-0 flex flex-col gap-3 border-0 p-0 align-baseline">
						<section className="m-0 block rounded-[7px] border-[0.5px] border-solid bg-[lch(100_0_282.863)] p-0 align-baseline empty:hidden dark:bg-[lch(8.3_1.867_272)]">
							<ul className="mx-0 border-0 p-0 align-baseline [list-style:none]">
								<div
									className="m-0 border-0 p-0 align-baseline outline-offset-[-3px]"
									data-contextual-menu="true"
								>
									<li className="vcWAPl relative m-0 flex min-h-[60px] items-center justify-between gap-4 rounded-md border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
										<button
											className="0] absolute inset-0 block w-full cursor-default appearance-none rounded-md border-[none] [background:0 focus-visible:z-[3]"
											aria-label="Brave on macOS"
											type="button"
										/>
										<div className="m-0 flex flex-row items-center gap-4 border-0 p-0 align-baseline [-webkit-box-align:center]">
											<div className="relative m-0 flex flex-row border-0 p-0 align-baseline">
												<figure className="m-0 grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md border-0 bg-[lch(94.75_0_282.863)] p-0 align-baseline dark:bg-[lch(14.133_4.2_272)]">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														aria-hidden="true"
														role="img"
														fill="lch(39.286% 1 282.863 / 1)"
														viewBox="0 0 16 16"
														height="16"
														width="16"
														className=""
													>
														<path
															d="M13.7565 5.51628L13.324 4.34884L13.6216 3.67907C13.6589 3.5907 13.6403 3.49302 13.5751 3.42326L12.7612 2.6C12.403 2.24186 11.8728 2.11628 11.3938 2.28372L11.1658 2.36279L9.91934 1.01395L7.81237 1H7.79842L5.6775 1.0186L4.43564 2.37674L4.21239 2.29767C3.72867 2.12558 3.19379 2.25116 2.83565 2.6186L2.00775 3.45581C1.95193 3.51163 1.93798 3.5907 1.96589 3.66047L2.27751 4.35814L1.84961 5.52558L1.86594 5.58738L1.84961 5.62798L3.1499 10.4598L3.39379 11.386C3.40891 11.4441 3.42613 11.5014 3.44538 11.5578L3.45425 11.5908C3.55658 11.9582 3.78448 12.2791 4.08216 12.5629L4.16202 12.6164C4.21973 12.6662 4.27998 12.7135 4.34262 12.7581C4.34262 12.7581 5.8775 13.8419 7.38912 14.8233C7.524 14.9116 7.66354 14.9721 7.81237 14.9721C7.96121 14.9721 8.10074 14.9116 8.23563 14.8233C9.93794 13.707 11.2821 12.7535 11.2821 12.7535C11.7472 12.4186 12.0821 11.9349 12.2263 11.3814L13.4821 6.57674L13.7565 5.51628ZM12.464 5.63982C12.464 5.63982 12.464 5.66308 12.4454 5.72355C12.4289 5.78952 12.3929 5.85224 12.3681 5.89539C12.351 5.92526 12.3392 5.94575 12.343 5.95145C12.3221 5.97471 12.2954 6.00495 12.2686 6.03519C12.2419 6.06538 12.2151 6.09567 12.1942 6.11889L10.6547 7.7561C10.6128 7.80261 10.5989 7.88634 10.6221 7.94215L10.9431 8.70029C10.9663 8.7561 10.971 8.85378 10.9477 8.90959L10.8593 9.1468C10.7896 9.3468 10.664 9.52355 10.4965 9.65843L10.1849 9.91424C10.1384 9.95145 10.0547 9.96541 9.99887 9.9375L9.00818 9.46773C8.95237 9.44448 8.86865 9.38866 8.82213 9.3468L8.11516 8.70959C8.01284 8.61657 8.00353 8.45378 8.10121 8.3561L9.58492 7.35145C9.63608 7.31424 9.65469 7.24448 9.62678 7.18866L8.97097 5.96075C8.93841 5.90959 8.93841 5.81657 8.96167 5.76075L9.04074 5.57936C9.06399 5.51889 9.13376 5.45843 9.18957 5.43517L11.1012 4.70959C11.1617 4.68634 11.157 4.66308 11.0965 4.65843L9.86399 4.54215C9.80353 4.5375 9.70585 4.54215 9.64539 4.56075L8.54772 4.86773C8.48725 4.88168 8.45004 4.9468 8.45935 5.00727L8.83609 7.09564C8.85004 7.1561 8.84539 7.24448 8.83144 7.28634C8.81748 7.3282 8.75702 7.37471 8.69655 7.38866L7.98493 7.55145C7.92446 7.56541 7.82679 7.56541 7.76633 7.55145L7.00354 7.38866C6.94307 7.37471 6.88261 7.33285 6.86865 7.28634C6.8547 7.23982 6.8547 7.1561 6.864 7.09564L7.2454 5.00727C7.2547 4.9468 7.21749 4.88634 7.15703 4.86773L6.05936 4.56075C5.99889 4.5468 5.90122 4.5375 5.84075 4.54215L4.6082 4.65843C4.54774 4.66308 4.54774 4.68634 4.60355 4.70959L6.51517 5.42587C6.57098 5.44913 6.64075 5.51424 6.664 5.57006L6.74307 5.75145C6.76633 5.80727 6.76168 5.89564 6.73377 5.95145L6.08261 7.17936C6.05471 7.23517 6.07331 7.30959 6.12447 7.34215L7.60819 8.34215C7.70121 8.44448 7.69656 8.60261 7.59423 8.69564L6.88726 9.33285C6.84075 9.37471 6.75703 9.43052 6.70121 9.45843L5.71517 9.9282C5.65936 9.9561 5.57564 9.94215 5.52913 9.90494L5.2175 9.65378C5.05006 9.51889 4.92448 9.34215 4.85006 9.14215L4.76169 8.90494C4.73843 8.84447 4.74308 8.75145 4.76634 8.69564L5.08727 7.9375C5.11052 7.88169 5.09657 7.79796 5.05471 7.75145L3.51518 6.11424C3.47332 6.07238 3.40355 5.99331 3.36635 5.9468C3.36635 5.9468 3.28728 5.84448 3.25472 5.73285C3.23611 5.66773 3.23611 5.64913 3.23611 5.64913C3.23146 5.58866 3.24076 5.48634 3.25007 5.42587L3.29658 5.29099C3.32448 5.23517 3.37565 5.1468 3.40821 5.09564L3.93378 4.31889L3.94505 4.3034C3.98233 4.25207 4.03501 4.17957 4.06867 4.1375L4.74773 3.28634C4.78494 3.23982 4.82215 3.20261 4.8268 3.20261H4.83611C4.83611 3.20261 4.88727 3.20727 4.94773 3.22122L5.99424 3.41657C6.02447 3.42122 6.06401 3.42936 6.10354 3.4375C6.14307 3.44564 6.18261 3.45378 6.21284 3.45843L6.23145 3.46308C6.29191 3.47238 6.38959 3.46773 6.45005 3.44913L7.31982 3.17006C7.37563 3.15145 7.4733 3.12354 7.53377 3.10959C7.53377 3.10959 7.71051 3.07238 7.8547 3.07238C7.99888 3.06773 8.17563 3.10959 8.17563 3.10959C8.23144 3.12354 8.32911 3.15145 8.38958 3.17006L9.25934 3.44913C9.31981 3.46773 9.41748 3.47238 9.47795 3.46308L9.49655 3.45843C9.55701 3.44913 9.65469 3.43052 9.71515 3.41657L10.7524 3.21192C10.8128 3.20261 10.864 3.19331 10.864 3.19331H10.8733C10.8779 3.18866 10.9151 3.23052 10.9524 3.27703L11.6314 4.1282C11.6733 4.17936 11.7337 4.25843 11.7663 4.30959L12.2919 5.08634C12.3291 5.1375 12.3756 5.22587 12.4035 5.28168L12.45 5.41657C12.4593 5.47703 12.464 5.57936 12.464 5.63982ZM7.94705 9.55347C7.96566 9.55347 8.02612 9.57207 8.08194 9.59533L8.68658 9.84649C8.7424 9.86975 8.83542 9.91161 8.89123 9.93951L9.80286 10.4046C9.85867 10.4325 9.86332 10.4837 9.81216 10.5209L9.00751 11.093C8.95635 11.1302 8.87728 11.1907 8.83077 11.2325L8.47263 11.5442C8.44941 11.5651 8.41923 11.5918 8.38905 11.6185C8.35881 11.6452 8.32845 11.6721 8.30519 11.693L7.9517 12C7.90519 12.0418 7.83078 12.0418 7.78426 12L7.44008 11.693C7.41682 11.6721 7.38659 11.6453 7.35636 11.6186C7.32617 11.5919 7.29586 11.5651 7.27264 11.5442L6.9145 11.2372C6.86799 11.1953 6.78892 11.1349 6.73776 11.0977L5.93311 10.5302C5.88195 10.493 5.8866 10.4418 5.94241 10.4139L6.85403 9.93951C6.90985 9.91161 7.00287 9.86975 7.05869 9.84649L7.66333 9.59533C7.71915 9.57207 7.77961 9.55347 7.79822 9.55347H7.94705Z"
															clip-rule="evenodd"
															fill-rule="evenodd"
														/>
													</svg>
												</figure>
											</div>
											<div className="m-0 flex flex-col gap-0.5 border-0 p-0 align-baseline">
												<span className="m-0 border-0 p-0 text-left align-baseline font-medium text-[13px] text-[lch(19.643_1_282.863)] dark:text-[lch(90.994_1.933_272)]">
													{currentSessionData
														? formatSessionInfo(currentSessionData).name
														: "Current Session"}
												</span>
												<div className="m-0 flex shrink-0 items-center border-0 p-0 align-baseline [-webkit-box-align:center] [flex-flow:wrap]">
													<span className="my-0 mr-1 ml-0 inline-flex border-0 p-0 text-left align-baseline font-[450] text-[lch(39.286_1_282.863)] text-xs">
														<div className="m-0 flex shrink-0 flex-row items-center gap-1 border-0 p-0 align-baseline [-webkit-box-align:center]">
															{getDeviceIcon(
																currentSessionData
																	? formatSessionInfo(currentSessionData).icon
																	: "desktop",
															)}
															<span className="m-0 border-0 p-0 text-left align-baseline font-[450] text-[lch(50_80_141.95)] text-xs">
																Current session
															</span>
														</div>
														<span className="my-0 mr-0 ml-1 inline-block border-0 p-0 align-baseline text-[13px] text-[lch(39.286_1_282.863)]">
															·
														</span>
													</span>
													<span className="my-0 mr-1 ml-0 inline-flex border-0 p-0 text-left align-baseline font-[450] text-[lch(39.286_1_282.863)] text-xs">
														<span className="m-0 border-0 p-0 align-baseline">
															{currentSessionData
																? formatSessionInfo(currentSessionData).location
																: "Unknown location"}
														</span>
													</span>
												</div>
											</div>
										</div>
									</li>
								</div>
							</ul>
						</section>
						<div className="m-0 flex scroll-mt-8 flex-col gap-4 border-0 p-0 align-baseline opacity-100">
							<div className="m-0 flex flex-col gap-3 border-0 p-0 align-baseline">
								<section className="m-0 block rounded-[7px] border-[0.5px] border-solid bg-[lch(100_0_282.863)] p-0 align-baseline empty:hidden dark:bg-[lch(8.3_1.867_272)]">
									<header className="NwcySd m-0 flex min-h-[60px] items-center justify-between gap-4 border-0 border-b-[0.5px] border-solid px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
										<div className="m-0 flex flex-col gap-0.5 border-0 p-0 align-baseline opacity-100">
											<h3 className="m-0 border-0 p-0 text-left align-baseline font-medium text-[13px] text-[lch(9.821_0_282.863)] leading-tight dark:text-[lch(100_0_272)]">
												<NumberFlow value={otherSessions.length} /> other
												session
												{otherSessions.length !== 1 ? "s" : ""}
											</h3>
											<span className="m-0 border-0 p-0 text-left align-baseline font-[450] text-[lch(39.286_1_282.863)] text-xs dark:text-[lch(63.975_7_271.985)]" />
										</div>
										<div className="m-0 flex flex-row gap-1 border-0 p-0 align-baseline">
											{/*  <div
                      data-menu-open="false"
                      className="m-0 flex flex-row border-0 p-0 align-baseline transition-[visibility] delay-[0.3s] duration-[linear,opacity]"
                    >
                      <button
                        onClick={handleRevokeAllSessions}
                        className="relative m-0 inline-flex h-8 min-w-8 shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-[5px] border-[0.5px] border-transparent border-solid bg-transparent px-3.5 py-0 align-top font-medium text-[13px] text-[lch(19.643_1_282.863)] text-[lch(64.821_1_282.863)] transition-[border,background-color,color,opacity] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center] [app-region:no-drag] disabled:cursor-default disabled:opacity-60"
                        type="button"
                        aria-label="Revoke all other sessions"
                      >
                        Revoke all
                      </button>
                    </div> */}
										</div>
									</header>
									<ul className="mx-0 border-0 p-0 align-baseline [list-style:none]">
										<AnimatePresence initial={false}>
											{otherSessions.map((session, index) => {
												const sessionInfo = formatSessionInfo(session);
												const isLast = index === otherSessions.length - 1;

												return (
													<motion.div
														key={session.id}
														initial={{ opacity: 1, height: "auto" }}
														exit={{ opacity: 0, height: 0 }}
														transition={{ duration: 0.2 }}
														className="m-0 border-0 p-0 align-baseline outline-offset-[-3px]"
														data-contextual-menu="true"
													>
														<li
															className={`relative m-0 flex min-h-[60px] items-center justify-between gap-4 border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify] hover:bg-[lch(98.542_0_282.863)] dark:hover:bg-[lch(10_1.867_272)] ${
																isLast ? "rounded-br-md rounded-bl-md" : ""
															}`}
														>
															<button
																className={`absolute inset-0 block w-full cursor-default appearance-none ${
																	isLast
																		? "rounded-[0_0_6px_6px]"
																		: "rounded-none"
																} border-[none] [background:0 focus-visible:z-[3]`}
																aria-label={sessionInfo.name}
																type="button"
															/>
															<div className="m-0 flex flex-row items-center gap-4 border-0 p-0 align-baseline [-webkit-box-align:center]">
																<div className="relative m-0 flex flex-row border-0 p-0 align-baseline">
																	<figure className="m-0 grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md border-0 bg-[lch(94.75_0_282.863)] p-0 align-baseline dark:bg-[lch(15_2_272)]">
																		{getDeviceIcon(sessionInfo.icon)}
																	</figure>
																</div>
																<div className="m-0 flex flex-col gap-0.5 border-0 p-0 align-baseline">
																	<span className="m-0 border-0 p-0 text-left align-baseline font-medium text-[13px] text-[lch(19.643_1_282.863)] dark:text-[lch(100_0_272)]">
																		{sessionInfo.name}
																	</span>
																	<div className="m-0 flex shrink-0 items-center border-0 p-0 align-baseline [-webkit-box-align:center] [flex-flow:wrap]">
																		<span className="my-0 mr-1 ml-0 inline-flex border-0 p-0 text-left align-baseline font-[450] text-[lch(39.286_1_282.863)] text-xs dark:text-[lch(63.975_7_271.985)]">
																			<span className="m-0 border-0 p-0 align-baseline">
																				{sessionInfo.location}
																			</span>
																			<span className="my-0 mr-0 ml-1 inline-block border-0 p-0 align-baseline text-[13px] text-[lch(39.286_1_282.863)] dark:text-[lch(63.975_7_271.985)]">
																				·
																			</span>
																		</span>
																		<span className="my-0 mr-1 ml-0 inline-flex border-0 p-0 text-left align-baseline font-[450] text-[lch(39.286_1_282.863)] text-xs dark:text-[lch(63.975_7_271.985)]">
																			<span className="m-0 border-0 p-0 align-baseline">
																				Last seen {sessionInfo.lastSeen}
																			</span>
																		</span>
																	</div>
																</div>
															</div>
															<div className="relative m-0 flex gap-1 border-0 p-0 align-baseline">
																<button
																	onClick={() =>
																		handleRevokeSession(session.token)
																	}
																	disabled={revokingToken === session.token}
																	className="relative m-0 inline-flex h-8 min-w-8 shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-[5px] border-[0.5px] border-transparent border-solid bg-transparent px-3.5 py-0 align-top font-medium text-[13px] text-[lch(64.821_1_282.863)] transition-[border,background-color,color,opacity] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center] [app-region:no-drag] disabled:cursor-default disabled:opacity-60 dark:text-[lch(40.559_1.933_272)]"
																	type="button"
																>
																	{revokingToken === session.token
																		? "Revoking..."
																		: "Revoke"}
																</button>
															</div>
														</li>
													</motion.div>
												);
											})}
										</AnimatePresence>
									</ul>
								</section>
							</div>
						</div>

						{/* Passkeys Section */}
						<div className="m-0 mt-6 flex scroll-mt-8 flex-col gap-4 border-0 p-0 align-baseline opacity-100">
							<div className="m-0 flex flex-row items-center justify-between gap-4 border-0 p-0 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]">
								<div className="m-0 flex grow flex-col gap-0.5 border-0 p-0 align-baseline [-webkit-box-flex:1]">
									<div className="m-0 flex flex-row items-center gap-1 border-0 p-0 align-baseline [-webkit-box-align:center]">
										<h3 className="m-0 block border-0 p-0 text-left align-baseline font-[450] text-[15px] text-[lch(9.723_0_282.863)] leading-[1.4375rem] dark:text-[lch(100_0_272)]">
											Passkeys
										</h3>
									</div>
									<div className="cHuGaL m-0 border-0 p-0 text-left align-baseline font-[450] text-[13px] text-[lch(38.893_1_282.863)] leading-[22px] dark:text-[lch(62.6_1.35_272)]">
										Secure passwordless authentication
									</div>
								</div>
								<AddPasskeyDialog passkeyCount={passkeys?.length || 0} />
							</div>
							<div className="m-0 flex flex-col gap-3 border-0 p-0 align-baseline">
								<section className="m-0 block rounded-[7px] border-[0.5px] border-solid bg-[lch(100_0_282.863)] p-0 align-baseline empty:hidden dark:bg-[lch(8.3_1.867_272)]">
									{passkeysLoading ? (
										<ul className="mx-0 border-0 p-0 align-baseline [list-style:none]">
											{[...Array(2)].map((_, i) => (
												<li
													key={`skeleton-passkey-${i}`}
													className="relative m-0 flex min-h-[60px] items-center justify-between gap-4 border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify]"
												>
													<div className="m-0 flex flex-row items-center gap-4 border-0 p-0 align-baseline [-webkit-box-align:center]">
														<Skeleton className="h-8 w-8 shrink-0 rounded-md" />
														<div className="m-0 flex flex-col gap-0.5 border-0 p-0 align-baseline">
															<Skeleton className="h-4 w-32" />
															<Skeleton className="h-3 w-24" />
														</div>
													</div>
													<Skeleton className="h-8 w-16 rounded-[5px]" />
												</li>
											))}
										</ul>
									) : passkeys && passkeys.length > 0 ? (
										<ul className="mx-0 border-0 p-0 align-baseline [list-style:none]">
											<AnimatePresence initial={false}>
												{passkeys.map((passkey: any, index: number) => {
													const isLast = index === passkeys.length - 1;
													return (
														<motion.div
															key={passkey.id}
															initial={{ opacity: 1, height: "auto" }}
															exit={{ opacity: 0, height: 0 }}
															transition={{ duration: 0.2 }}
															className="m-0 border-0 p-0 align-baseline outline-offset-[-3px]"
														>
															<li
																className={`relative m-0 flex min-h-[60px] items-center justify-between gap-4 border-0 px-4 py-3 align-baseline [-webkit-box-align:center] [-webkit-box-pack:justify] hover:bg-[lch(98.542_0_282.863)] dark:hover:bg-[lch(10_1.867_272)] ${
																	isLast ? "rounded-br-md rounded-bl-md" : ""
																}`}
															>
																<div className="m-0 flex flex-row items-center gap-4 border-0 p-0 align-baseline [-webkit-box-align:center]">
																	<div className="relative m-0 flex flex-row border-0 p-0 align-baseline">
																		<figure className="m-0 grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md border-0 bg-[lch(94.75_0_282.863)] p-0 align-baseline dark:bg-[lch(15_2_272)]">
																			<Key className="h-4 w-4" />
																		</figure>
																	</div>
																	<div className="m-0 flex flex-col gap-0.5 border-0 p-0 align-baseline">
																		<span className="m-0 border-0 p-0 text-left align-baseline font-medium text-[13px] text-[lch(19.643_1_282.863)] dark:text-[lch(100_0_272)]">
																			{passkey.name || "Unnamed Passkey"}
																		</span>
																		<div className="m-0 flex shrink-0 items-center border-0 p-0 align-baseline [-webkit-box-align:center] [flex-flow:wrap]">
																			<span className="my-0 mr-1 ml-0 inline-flex border-0 p-0 text-left align-baseline font-[450] text-[lch(39.286_1_282.863)] text-xs dark:text-[lch(63.975_7_271.985)]">
																				Created{" "}
																				{passkey.createdAt
																					? formatDistanceToNow(
																							parseISO(passkey.createdAt),
																							{ addSuffix: true },
																						)
																					: "Unknown"}
																			</span>
																		</div>
																	</div>
																</div>
																<div className="relative m-0 flex gap-1 border-0 p-0 align-baseline">
																	<button
																		onClick={() =>
																			handleDeletePasskey(passkey.id)
																		}
																		disabled={deletingPasskeyId === passkey.id}
																		className="relative m-0 inline-flex h-8 min-w-8 shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-[5px] border-[0.5px] border-transparent border-solid bg-transparent px-3.5 py-0 align-top font-medium text-[13px] text-[lch(64.821_1_282.863)] transition-[border,background-color,color,opacity] duration-[0.15s] [-webkit-box-align:center] [-webkit-box-pack:center] [app-region:no-drag] disabled:cursor-default disabled:opacity-60 dark:text-[lch(40.559_1.933_272)]"
																		type="button"
																	>
																		{deletingPasskeyId === passkey.id
																			? "Deleting..."
																			: "Delete"}
																	</button>
																</div>
															</li>
														</motion.div>
													);
												})}
											</AnimatePresence>
										</ul>
									) : (
										<div className="px-4 py-8 text-center">
											<p className="text-[lch(39.286_1_282.863)] text-sm dark:text-[lch(63.975_7_271.985)]">
												No passkeys added yet. Add a passkey to enable
												passwordless authentication.
											</p>
										</div>
									)}
								</section>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
