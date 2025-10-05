import type { Variants } from "framer-motion";

// Fade in animations
export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.3 } },
	exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
	exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const fadeInDown: Variants = {
	hidden: { opacity: 0, y: -20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
	exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

export const slideInLeft: Variants = {
	hidden: { opacity: 0, x: -30 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
	exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export const slideInRight: Variants = {
	hidden: { opacity: 0, x: 30 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
	exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

// Scale animations
export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.3, ease: "easeOut" },
	},
	exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const hoverScale: Variants = {
	rest: { scale: 1 },
	hover: {
		scale: 1.02,
		y: -2,
		boxShadow:
			"0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
		transition: { duration: 0.2, ease: "easeOut" },
	},
	tap: { scale: 0.98, transition: { duration: 0.1 } },
};

// Button animations
export const buttonPress: Variants = {
	rest: { scale: 1 },
	hover: { scale: 1.05, transition: { duration: 0.2 } },
	tap: { scale: 0.95, transition: { duration: 0.1 } },
};

export const buttonFill: Variants = {
	rest: { scale: 1, backgroundColor: "var(--background)" },
	hover: {
		scale: 1.02,
		backgroundColor: "var(--accent)",
		transition: { duration: 0.2 },
	},
	tap: { scale: 0.98 },
};

// List animations
export const staggeredList: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
};

export const listItem: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: "easeOut" },
	},
};

// Grid animations
export const staggeredGrid: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.3,
		},
	},
};

export const gridItem: Variants = {
	hidden: { opacity: 0, scale: 0.95, y: 20 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: { duration: 0.4, ease: "easeOut" },
	},
	hover: {
		scale: 1.02,
		y: -4,
		boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
		transition: { duration: 0.2, ease: "easeOut" },
	},
};

// Modal animations
export const modalVariant: Variants = {
	hidden: { opacity: 0, scale: 0.95, y: 20 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: { duration: 0.3, ease: "easeOut" },
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		y: 10,
		transition: { duration: 0.2, ease: "easeIn" },
	},
};

export const overlayVariant: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.2 } },
	exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Progress bar animation
export const progressVariant: Variants = {
	hidden: { width: "0%" },
	visible: (progress: number) => ({
		width: `${progress}%`,
		transition: { duration: 1.2, ease: "easeOut", delay: 0.5 },
	}),
};

// Checkbox animation
export const checkboxVariant: Variants = {
	unchecked: { scale: 1, rotate: 0 },
	checked: {
		scale: 1.1,
		rotate: 5,
		transition: { duration: 0.2, ease: "easeOut" },
	},
};

// Table row animation
export const tableRowVariant: Variants = {
	rest: {
		backgroundColor: "transparent",
		scale: 1,
		transition: { duration: 0.2 },
	},
	hover: {
		backgroundColor: "var(--accent)",
		scale: 1.01,
		y: -1,
		boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.05)",
		transition: { duration: 0.2, ease: "easeOut" },
	},
	tap: { scale: 0.99, transition: { duration: 0.1 } },
};

// Card animations
export const cardVariant: Variants = {
	rest: {
		y: 0,
		boxShadow:
			"0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
		transition: { duration: 0.2 },
	},
	hover: {
		y: -4,
		boxShadow:
			"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
		transition: { duration: 0.3, ease: "easeOut" },
	},
};

// Status badge animation
export const badgeVariant: Variants = {
	hidden: { opacity: 0, scale: 0.8 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.3, ease: "easeOut" },
	},
};

// Loading skeleton animation
export const skeletonVariant: Variants = {
	loading: {
		opacity: [0.5, 1, 0.5],
		transition: {
			duration: 1.5,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		},
	},
	loaded: {
		opacity: 0,
		transition: { duration: 0.3 },
	},
};

// Icon animations
export const iconSpin: Variants = {
	rest: { rotate: 0 },
	hover: {
		rotate: 360,
		transition: { duration: 0.6, ease: "easeInOut" },
	},
};

export const iconBounce: Variants = {
	rest: { y: 0 },
	hover: {
		y: -2,
		transition: {
			duration: 0.2,
			repeat: 2,
			repeatType: "reverse",
		},
	},
};

// Page transition animations
export const pageVariant: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: "easeOut",
			staggerChildren: 0.1,
		},
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: { duration: 0.3, ease: "easeIn" },
	},
};

// Spring configurations
export const springConfig = {
	type: "spring" as const,
	stiffness: 300,
	damping: 30,
};

export const gentleSpring = {
	type: "spring" as const,
	stiffness: 200,
	damping: 25,
};

export const bouncySpring = {
	type: "spring" as const,
	stiffness: 400,
	damping: 15,
};
