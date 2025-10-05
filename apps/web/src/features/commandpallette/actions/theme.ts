"use client";

import React, { useMemo } from "react";

import type { Action } from "kbar";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

// Theme toggle helper with view transition support (same as ThemeSwitch)
function toggleTheme(theme: string, setTheme: (theme: string) => void) {
	if (!document?.startViewTransition) {
		setTheme(theme);
		return;
	}

	document.startViewTransition?.(() => {
		setTheme(theme);
	});
}

export function useThemeActions(): Action[] {
	const { setTheme } = useTheme();

	return useMemo(
		() => [
			{
				id: "theme",
				name: "Change theme",
				keywords: "theme dark light mode",
				section: "Preferences",
				icon: React.createElement(SunMoon, { size: 16 }) as any,
			},
			{
				id: "theme-light",
				name: "Light",
				keywords: "light theme",
				section: "Preferences",
				parent: "theme",
				icon: React.createElement(Sun, { size: 16 }) as any,
				perform: () => toggleTheme("light", setTheme),
			},
			{
				id: "theme-dark",
				name: "Dark",
				keywords: "dark theme",
				section: "Preferences",
				parent: "theme",
				icon: React.createElement(Moon, { size: 16 }) as any,
				perform: () => toggleTheme("dark", setTheme),
			},
			{
				id: "theme-system",
				name: "System",
				keywords: "system theme auto",
				section: "Preferences",
				parent: "theme",
				icon: React.createElement(SunMoon, { size: 16 }) as any,
				perform: () => toggleTheme("system", setTheme),
			},
		],
		[setTheme],
	);
}
