import type { ReactElement, ReactNode } from "react";

export type ActionId = string;

export interface CommandAction {
	id: ActionId;
	name: string;
	shortcut?: string[];
	keywords?: string;
	section?: string;
	icon?: string | ReactElement | ReactNode;
	subtitle?: string;
	perform?: () => void;
	parent?: ActionId;
}
