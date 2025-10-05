// Tremor BarList [v1.0.0]

import React from "react";

import { useRouter } from "next/navigation";

import { cx, focusRing } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Bar<T> = T & {
	key?: string;
	href?: string;
	value: number;
	name: string;
	image?: string | null;
};

interface BarListProps<T = unknown>
	extends React.HTMLAttributes<HTMLDivElement> {
	data: Bar<T>[];
	valueFormatter?: (value: number) => string;
	showAnimation?: boolean;
	onValueChange?: (payload: Bar<T>) => void;
	sortOrder?: "ascending" | "descending" | "none";
}

function BarListInner<T>(
	{
		data = [],
		valueFormatter = (value) => value.toString(),
		showAnimation = true,
		onValueChange,
		sortOrder = "descending",
		className,
		...props
	}: BarListProps<T>,
	forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
	const router = useRouter();
	const Component =
		onValueChange || data.some((item) => item.href) ? "button" : "div";
	const sortedData = React.useMemo(() => {
		if (sortOrder === "none") {
			return data;
		}
		return [...data].sort((a, b) => {
			return sortOrder === "ascending" ? a.value - b.value : b.value - a.value;
		});
	}, [data, sortOrder]);

	const widths = React.useMemo(() => {
		const maxValue = Math.max(...sortedData.map((item) => item.value), 0);
		return sortedData.map((item) =>
			item.value === 0 ? 0 : Math.max((item.value / maxValue) * 100, 2),
		);
	}, [sortedData]);

	const rowHeight = "h-8";

	return (
		<div
			ref={forwardedRef}
			className={cx("flex justify-between space-x-6", className)}
			// aria-sort={sortOrder}
			tremor-id="tremor-raw"
			{...props}
		>
			<div className="relative w-full space-y-1.5">
				{sortedData.map((item, index) => (
					<Component
						key={item.key ?? item.name}
						onClick={() => {
							if (item.href) {
								router.push(item.href);
							} else {
								onValueChange?.(item);
							}
						}}
						className={cx(
							// base
							"group w-full rounded-sm",
							// focus
							focusRing,
							onValueChange || item.href
								? [
										"-m-0! cursor-pointer",
										// hover
										"hover:bg-gray-50 dark:hover:bg-gray-900",
									]
								: "",
						)}
					>
						<div
							className={cx(
								// base
								"flex items-center rounded-sm transition-all",
								rowHeight,
								// background color
								"bg-[#D23B84]/40 dark:bg-[#B32E6D]/50",
								onValueChange || item.href
									? "group-hover:bg-[#E0407A]/50 dark:group-hover:bg-[#C0347A]/60"
									: "",
								// margin and duration
								{
									"mb-0": index === sortedData.length - 1,
									"duration-800": showAnimation,
								},
							)}
							style={{ width: `${widths[index]}%` }}
						>
							<div
								className={cx(
									"absolute left-2 flex max-w-full items-center gap-2 pr-2",
								)}
							>
								<Avatar className="size-6">
									{item.image && (
										<AvatarImage src={item.image} alt={item.name} />
									)}
									<AvatarFallback className="bg-white/20 font-medium text-gray-900 text-xs dark:text-gray-50">
										{item.name
											.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>

								<p
									className={cx(
										// base
										"truncate whitespace-nowrap text-sm",
										// text color
										"text-gray-900 dark:text-gray-50",
									)}
								>
									{item.name}
								</p>
							</div>
						</div>
					</Component>
				))}
			</div>
			<div>
				{sortedData.map((item, index) => (
					<div
						key={item.key ?? item.name}
						className={cx(
							"flex items-center justify-end",
							rowHeight,
							index === sortedData.length - 1 ? "mb-0" : "mb-1.5",
						)}
					>
						<p
							className={cx(
								// base
								"truncate whitespace-nowrap text-sm leading-none",
								// text color
								"text-gray-900 dark:text-gray-50",
							)}
						>
							{valueFormatter(item.value)}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

BarListInner.displayName = "BarList";

const BarList = React.forwardRef(BarListInner) as <T>(
	p: BarListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof BarListInner>;

export { BarList, type BarListProps };
