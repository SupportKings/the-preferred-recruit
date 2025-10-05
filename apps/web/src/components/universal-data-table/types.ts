import type { ReactNode } from "react";

import type { Database } from "@/utils/supabase/database.types";

import type {
	ColumnConfig,
	ColumnDataType,
	FiltersState,
} from "@/components/data-table-filter/core/types";

import type { LucideIcon } from "lucide-react";

// Generic types for any Supabase table row
export type UniversalTableRow = Record<string, any>;

// Configuration for table relationships
export interface TableRelationship {
	table: string;
	column: string;
	type?: "single" | "many";
	select?: string;
}

// Configuration for the universal table
export interface UniversalTableConfig<
	T extends UniversalTableRow = UniversalTableRow,
> {
	// Core table configuration
	table: string;
	supabaseSchema?: keyof Database;

	// Data configuration
	data?: T[];
	columns: any[]; // TanStack table columns
	columnsConfig: ColumnConfig<T>[];

	// Relationships for joins
	relationships?: Record<string, TableRelationship>;

	// Search and filtering
	searchColumns?: string[];
	facetedColumns?: string[];
	defaultFilters?: FiltersState;

	// UI configuration
	enableUrlState?: boolean;
	urlStateKey?: string;
	enableSelection?: boolean;
	pageSize?: number;
	serverSide?: boolean;
	rowActions?: RowAction<T>[];

	// Empty state
	emptyStateMessage?: string;
	emptyStateAction?: React.ReactNode;
}

// Sorting configuration
export interface SortConfig {
	column: string;
	direction: "asc" | "desc";
}

// Query configuration for Supabase
export interface SupabaseQueryConfig {
	table: string;
	schema?: string;
	select?: string;
	filters?: FiltersState;
	searchTerm?: string;
	searchColumns?: string[];
	relationships?: Record<string, TableRelationship>;
	page?: number;
	pageSize?: number;
	sorting?: SortConfig[];
}

// Faceted data for filter counts
export interface FacetedData {
	[columnId: string]: Map<string, number> | [number, number] | undefined;
}

// Row action configuration
export interface RowAction<T extends UniversalTableRow = UniversalTableRow> {
	label: string;
	icon?: LucideIcon;
	onClick: (row: T) => void;
	variant?: "default" | "destructive";
	disabled?: (row: T) => boolean;
	hidden?: (row: T) => boolean;
}

// Column builder interface
export interface UniversalColumnBuilder<T extends UniversalTableRow> {
	text(accessor: keyof T): TextColumnBuilder<T>;
	number(accessor: keyof T): NumberColumnBuilder<T>;
	date(accessor: keyof T): DateColumnBuilder<T>;
	option(accessor: keyof T): OptionColumnBuilder<T>;
	multiOption(accessor: keyof T): MultiOptionColumnBuilder<T>;
	relation(accessor: keyof T, relationTable: string): RelationColumnBuilder<T>;
}

interface BaseColumnBuilder<T, TType extends ColumnDataType> {
	displayName(name: string): this;
	icon(icon: LucideIcon): this;
	searchable(): this;
	sortable(): this;
	faceted(): this;
	build(): ColumnConfig<T, TType>;
}

export interface TextColumnBuilder<T> extends BaseColumnBuilder<T, "text"> {}
export interface NumberColumnBuilder<T> extends BaseColumnBuilder<T, "number"> {
	min(value: number): this;
	max(value: number): this;
	currency(code?: string): this;
}
export interface DateColumnBuilder<T> extends BaseColumnBuilder<T, "date"> {}
export interface OptionColumnBuilder<T>
	extends BaseColumnBuilder<T, "option"> {}
export interface MultiOptionColumnBuilder<T>
	extends BaseColumnBuilder<T, "multiOption"> {}
export interface RelationColumnBuilder<T>
	extends BaseColumnBuilder<T, "option"> {
	renderAs(render: (value: any) => React.ReactNode): this;
}
