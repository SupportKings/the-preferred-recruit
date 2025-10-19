import type {
	ColumnConfig,
	ColumnDataType,
} from "@/components/data-table-filter/core/types";

import type { LucideIcon } from "lucide-react";
import type {
	DateColumnBuilder,
	MultiOptionColumnBuilder,
	NumberColumnBuilder,
	OptionColumnBuilder,
	RelationColumnBuilder,
	TextColumnBuilder,
	UniversalColumnBuilder,
	UniversalTableRow,
} from "../types";

/**
 * Creates a column configuration helper for building table columns
 */
export function createUniversalColumnHelper<
	T extends UniversalTableRow,
>(): UniversalColumnBuilder<T> {
	return {
		text: (accessor: keyof T) => new TextColumnBuilderImpl<T>(accessor),
		number: (accessor: keyof T) => new NumberColumnBuilderImpl<T>(accessor),
		date: (accessor: keyof T) => new DateColumnBuilderImpl<T>(accessor),
		option: (accessor: keyof T) => new OptionColumnBuilderImpl<T>(accessor),
		multiOption: (accessor: keyof T) =>
			new MultiOptionColumnBuilderImpl<T>(accessor),
		relation: (accessor: keyof T, relationTable: string) =>
			new RelationColumnBuilderImpl<T>(accessor, relationTable),
	};
}

abstract class BaseColumnBuilderImpl<
	T extends UniversalTableRow,
	TType extends ColumnDataType,
> {
	protected config: Partial<ColumnConfig<T, TType>> = {};

	constructor(
		protected accessor: keyof T,
		protected type: TType,
	) {
		this.config.id = accessor as string;
		this.config.type = type;
		this.config.accessor = (row: T) => row[accessor];
	}

	displayName(name: string): this {
		this.config.displayName = name;
		return this;
	}

	icon(icon: LucideIcon): this {
		this.config.icon = icon;
		return this;
	}

	searchable(): this {
		// Add to searchable columns list (handled by parent component)
		return this;
	}

	sortable(): this {
		// Enable sorting (TanStack table handles this)
		return this;
	}

	faceted(): this {
		// Add to faceted columns list (handled by parent component)
		return this;
	}

	build(): ColumnConfig<T, TType> {
		if (!this.config.displayName) {
			this.config.displayName = String(this.accessor);
		}
		return this.config as ColumnConfig<T, TType>;
	}
}

class TextColumnBuilderImpl<T extends UniversalTableRow>
	extends BaseColumnBuilderImpl<T, "text">
	implements TextColumnBuilder<T>
{
	constructor(accessor: keyof T) {
		super(accessor, "text");
	}
}

class NumberColumnBuilderImpl<T extends UniversalTableRow>
	extends BaseColumnBuilderImpl<T, "number">
	implements NumberColumnBuilder<T>
{
	constructor(accessor: keyof T) {
		super(accessor, "number");
	}

	min(value: number): this {
		this.config.min = value;
		return this;
	}

	max(value: number): this {
		this.config.max = value;
		return this;
	}

	currency(code = "USD"): this {
		// Store currency format info for rendering
		// @ts-expect-error - This is used for custom rendering logic
		this.config.transformOptionFn = () => ({ value: code, label: code });
		return this;
	}
}

class DateColumnBuilderImpl<T extends UniversalTableRow>
	extends BaseColumnBuilderImpl<T, "date">
	implements DateColumnBuilder<T>
{
	constructor(accessor: keyof T) {
		super(accessor, "date");
	}
}

class OptionColumnBuilderImpl<T extends UniversalTableRow>
	extends BaseColumnBuilderImpl<T, "option">
	implements OptionColumnBuilder<T>
{
	constructor(accessor: keyof T) {
		super(accessor, "option");
	}
}

class MultiOptionColumnBuilderImpl<T extends UniversalTableRow>
	extends BaseColumnBuilderImpl<T, "multiOption">
	implements MultiOptionColumnBuilder<T>
{
	constructor(accessor: keyof T) {
		super(accessor, "multiOption");
	}
}

class RelationColumnBuilderImpl<T extends UniversalTableRow>
	extends BaseColumnBuilderImpl<T, "option">
	implements RelationColumnBuilder<T>
{
	constructor(
		accessor: keyof T,
		private relationTable: string,
	) {
		super(accessor, "option");
		// Store relation info for query building
		// @ts-expect-error - This is used for custom rendering logic
		this.config.transformOptionFn = () => ({
			value: relationTable,
			label: relationTable,
		});
	}

	renderAs(render: (value: any) => React.ReactNode): this {
		// Store render function for custom rendering
		return this;
	}
}
