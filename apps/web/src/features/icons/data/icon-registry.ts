import {
	Activity,
	Anchor,
	Apple,
	Archive,
	Award,
	Baby,
	Badge,
	BarChart,
	BarChart3,
	Battery,
	BicepsFlexed,
	Bike,
	Book,
	Brain,
	Briefcase,
	Building,
	Calendar,
	Camera,
	Car,
	Check,
	ChevronRight,
	Clock,
	Cloud,
	Code,
	Coffee,
	Compass,
	Computer,
	CreditCard,
	Crown,
	Database,
	Diamond,
	Dumbbell,
	Edit,
	Eye,
	FileText,
	Film,
	Filter,
	Flag,
	Flame,
	Folder,
	Gift,
	Globe,
	GraduationCap,
	Grid,
	Hammer,
	Headphones,
	Heart,
	Home,
	Image,
	Key,
	Laptop,
	Layers,
	Link,
	List,
	Lock,
	type LucideIcon,
	Mail,
	Map as MapIcon,
	MapPin,
	Medal,
	Megaphone,
	MessageSquare,
	Mic,
	Monitor,
	Moon,
	Mountain,
	Music,
	Package,
	Palette,
	Paperclip,
	PenTool,
	Phone,
	PieChart,
	Pizza,
	Plane,
	Play,
	Plus,
	Rocket,
	Salad,
	Save,
	Search,
	Send,
	Settings,
	Shield,
	ShoppingBag,
	ShoppingCart,
	Shuffle,
	Smartphone,
	Smile,
	Sparkles,
	Speaker,
	Star,
	Sun,
	Sunrise,
	Sunset,
	Tag,
	Target,
	Terminal,
	ThumbsUp,
	Timer,
	Trash,
	TrendingUp,
	Trophy,
	Truck,
	Tv,
	Umbrella,
	Upload,
	User,
	Users,
	Video,
	Volume,
	Wallet,
	Watch,
	Wifi,
	Wind,
	Wrench,
	Zap,
} from "lucide-react";

export interface IconRegistryItem {
	icon: LucideIcon;
	name: string;
	keywords?: string[];
}

export const iconRegistry: Record<string, IconRegistryItem> = {
	// Fitness & Sports
	bicepsflex: {
		icon: BicepsFlexed,
		name: "Biceps Flex",
		keywords: ["muscle", "strength", "workout"],
	},
	dumbbell: {
		icon: Dumbbell,
		name: "Dumbbell",
		keywords: ["weight", "gym", "exercise"],
	},
	activity: {
		icon: Activity,
		name: "Activity",
		keywords: ["fitness", "pulse", "health"],
	},
	target: {
		icon: Target,
		name: "Target",
		keywords: ["goal", "aim", "precision"],
	},
	trophy: {
		icon: Trophy,
		name: "Trophy",
		keywords: ["winner", "achievement", "success"],
	},
	medal: {
		icon: Medal,
		name: "Medal",
		keywords: ["award", "first", "competition"],
	},
	crown: { icon: Crown, name: "Crown", keywords: ["champion", "king", "best"] },
	bike: {
		icon: Bike,
		name: "Bike",
		keywords: ["cycling", "bicycle", "cardio"],
	},
	timer: {
		icon: Timer,
		name: "Timer",
		keywords: ["stopwatch", "time", "duration"],
	},

	// Health & Wellness
	heart: { icon: Heart, name: "Heart", keywords: ["love", "health", "cardio"] },
	brain: {
		icon: Brain,
		name: "Brain",
		keywords: ["mind", "mental", "intelligence"],
	},
	apple: {
		icon: Apple,
		name: "Apple",
		keywords: ["nutrition", "food", "healthy"],
	},
	salad: {
		icon: Salad,
		name: "Salad",
		keywords: ["vegetables", "diet", "healthy"],
	},
	pizza: { icon: Pizza, name: "Pizza", keywords: ["food", "meal", "cheat"] },
	coffee: {
		icon: Coffee,
		name: "Coffee",
		keywords: ["drink", "energy", "morning"],
	},
	moon: { icon: Moon, name: "Moon", keywords: ["sleep", "night", "rest"] },
	sun: { icon: Sun, name: "Sun", keywords: ["day", "morning", "energy"] },
	sunrise: {
		icon: Sunrise,
		name: "Sunrise",
		keywords: ["morning", "wake", "start"],
	},
	sunset: {
		icon: Sunset,
		name: "Sunset",
		keywords: ["evening", "end", "rest"],
	},
	baby: {
		icon: Baby,
		name: "Baby",
		keywords: ["infant", "prenatal", "postnatal"],
	},
	smile: {
		icon: Smile,
		name: "Smile",
		keywords: ["happy", "wellness", "positive"],
	},

	// Business & Professional
	briefcase: {
		icon: Briefcase,
		name: "Briefcase",
		keywords: ["business", "work", "corporate"],
	},
	building: {
		icon: Building,
		name: "Building",
		keywords: ["office", "company", "corporate"],
	},
	creditcard: {
		icon: CreditCard,
		name: "Credit Card",
		keywords: ["payment", "money", "finance"],
	},
	wallet: {
		icon: Wallet,
		name: "Wallet",
		keywords: ["money", "finance", "payment"],
	},
	barchart: {
		icon: BarChart,
		name: "Bar Chart",
		keywords: ["stats", "analytics", "data"],
	},
	barchart3: {
		icon: BarChart3,
		name: "Bar Chart 3",
		keywords: ["graph", "analytics", "metrics"],
	},
	piechart: {
		icon: PieChart,
		name: "Pie Chart",
		keywords: ["chart", "data", "analytics"],
	},
	trendingup: {
		icon: TrendingUp,
		name: "Trending Up",
		keywords: ["growth", "increase", "success"],
	},

	// Team & Social
	users: { icon: Users, name: "Users", keywords: ["team", "group", "people"] },
	user: {
		icon: User,
		name: "User",
		keywords: ["person", "individual", "profile"],
	},
	messagesquare: {
		icon: MessageSquare,
		name: "Message",
		keywords: ["chat", "communication", "talk"],
	},
	megaphone: {
		icon: Megaphone,
		name: "Megaphone",
		keywords: ["announce", "broadcast", "shout"],
	},
	mic: { icon: Mic, name: "Microphone", keywords: ["speak", "voice", "audio"] },
	speaker: {
		icon: Speaker,
		name: "Speaker",
		keywords: ["audio", "sound", "volume"],
	},

	// Education & Learning
	book: { icon: Book, name: "Book", keywords: ["education", "read", "learn"] },
	graduationcap: {
		icon: GraduationCap,
		name: "Graduation Cap",
		keywords: ["education", "degree", "university"],
	},
	filetext: {
		icon: FileText,
		name: "File Text",
		keywords: ["document", "paper", "text"],
	},
	pentool: {
		icon: PenTool,
		name: "Pen Tool",
		keywords: ["write", "draw", "design"],
	},
	edit: { icon: Edit, name: "Edit", keywords: ["modify", "change", "write"] },

	// General & Misc
	star: {
		icon: Star,
		name: "Star",
		keywords: ["favorite", "rating", "featured"],
	},
	sparkles: {
		icon: Sparkles,
		name: "Sparkles",
		keywords: ["magic", "special", "new"],
	},
	fire: { icon: Flame, name: "Fire", keywords: ["hot", "trending", "popular"] },
	zap: { icon: Zap, name: "Zap", keywords: ["lightning", "fast", "energy"] },
	rocket: {
		icon: Rocket,
		name: "Rocket",
		keywords: ["launch", "fast", "startup"],
	},
	flag: { icon: Flag, name: "Flag", keywords: ["milestone", "marker", "goal"] },
	award: {
		icon: Award,
		name: "Award",
		keywords: ["prize", "achievement", "certificate"],
	},
	gift: { icon: Gift, name: "Gift", keywords: ["present", "bonus", "reward"] },
	diamond: {
		icon: Diamond,
		name: "Diamond",
		keywords: ["premium", "luxury", "valuable"],
	},
	shield: {
		icon: Shield,
		name: "Shield",
		keywords: ["protection", "security", "safe"],
	},
	lock: { icon: Lock, name: "Lock", keywords: ["secure", "private", "closed"] },
	key: { icon: Key, name: "Key", keywords: ["access", "unlock", "permission"] },
	check: {
		icon: Check,
		name: "Check",
		keywords: ["done", "complete", "success"],
	},
	plus: { icon: Plus, name: "Plus", keywords: ["add", "new", "create"] },
	search: {
		icon: Search,
		name: "Search",
		keywords: ["find", "look", "discover"],
	},
	filter: {
		icon: Filter,
		name: "Filter",
		keywords: ["sort", "refine", "organize"],
	},
	settings: {
		icon: Settings,
		name: "Settings",
		keywords: ["config", "options", "preferences"],
	},
	wrench: {
		icon: Wrench,
		name: "Wrench",
		keywords: ["tool", "fix", "maintain"],
	},
	hammer: {
		icon: Hammer,
		name: "Hammer",
		keywords: ["build", "construct", "tool"],
	},

	// Technology
	computer: {
		icon: Computer,
		name: "Computer",
		keywords: ["desktop", "pc", "tech"],
	},
	laptop: {
		icon: Laptop,
		name: "Laptop",
		keywords: ["notebook", "portable", "tech"],
	},
	smartphone: {
		icon: Smartphone,
		name: "Smartphone",
		keywords: ["mobile", "phone", "device"],
	},
	monitor: {
		icon: Monitor,
		name: "Monitor",
		keywords: ["screen", "display", "desktop"],
	},
	tv: { icon: Tv, name: "TV", keywords: ["television", "screen", "media"] },
	camera: {
		icon: Camera,
		name: "Camera",
		keywords: ["photo", "picture", "capture"],
	},
	video: { icon: Video, name: "Video", keywords: ["movie", "film", "record"] },
	headphones: {
		icon: Headphones,
		name: "Headphones",
		keywords: ["audio", "music", "listen"],
	},
	music: { icon: Music, name: "Music", keywords: ["audio", "song", "melody"] },
	wifi: {
		icon: Wifi,
		name: "Wifi",
		keywords: ["internet", "network", "wireless"],
	},
	cloud: {
		icon: Cloud,
		name: "Cloud",
		keywords: ["storage", "online", "internet"],
	},
	database: {
		icon: Database,
		name: "Database",
		keywords: ["storage", "data", "server"],
	},
	terminal: {
		icon: Terminal,
		name: "Terminal",
		keywords: ["code", "command", "console"],
	},
	code: {
		icon: Code,
		name: "Code",
		keywords: ["programming", "develop", "script"],
	},

	// Navigation & Location
	compass: {
		icon: Compass,
		name: "Compass",
		keywords: ["direction", "navigation", "guide"],
	},
	map: {
		icon: MapIcon,
		name: "Map",
		keywords: ["location", "navigation", "geography"],
	},
	mappin: {
		icon: MapPin,
		name: "Map Pin",
		keywords: ["location", "place", "marker"],
	},
	globe: {
		icon: Globe,
		name: "Globe",
		keywords: ["world", "global", "international"],
	},
	anchor: {
		icon: Anchor,
		name: "Anchor",
		keywords: ["marine", "ship", "stable"],
	},
	plane: {
		icon: Plane,
		name: "Plane",
		keywords: ["travel", "flight", "airplane"],
	},
	car: { icon: Car, name: "Car", keywords: ["vehicle", "drive", "transport"] },
	truck: {
		icon: Truck,
		name: "Truck",
		keywords: ["delivery", "transport", "vehicle"],
	},

	// Organization
	folder: {
		icon: Folder,
		name: "Folder",
		keywords: ["directory", "organize", "files"],
	},
	archive: {
		icon: Archive,
		name: "Archive",
		keywords: ["storage", "box", "keep"],
	},
	package: {
		icon: Package,
		name: "Package",
		keywords: ["box", "delivery", "product"],
	},
	shoppingbag: {
		icon: ShoppingBag,
		name: "Shopping Bag",
		keywords: ["shop", "buy", "store"],
	},
	shoppingcart: {
		icon: ShoppingCart,
		name: "Shopping Cart",
		keywords: ["shop", "buy", "ecommerce"],
	},
	tag: { icon: Tag, name: "Tag", keywords: ["label", "category", "price"] },
	badge: {
		icon: Badge,
		name: "Badge",
		keywords: ["label", "tag", "identifier"],
	},

	// Time & Calendar
	calendar: {
		icon: Calendar,
		name: "Calendar",
		keywords: ["date", "schedule", "time"],
	},
	clock: { icon: Clock, name: "Clock", keywords: ["time", "hour", "schedule"] },
	watch: { icon: Watch, name: "Watch", keywords: ["time", "wrist", "track"] },

	// Nature & Weather
	mountain: {
		icon: Mountain,
		name: "Mountain",
		keywords: ["nature", "peak", "outdoor"],
	},
	umbrella: {
		icon: Umbrella,
		name: "Umbrella",
		keywords: ["rain", "weather", "protection"],
	},
	wind: { icon: Wind, name: "Wind", keywords: ["weather", "air", "breeze"] },

	// Communication
	mail: { icon: Mail, name: "Mail", keywords: ["email", "message", "send"] },
	send: {
		icon: Send,
		name: "Send",
		keywords: ["message", "deliver", "transmit"],
	},
	phone: {
		icon: Phone,
		name: "Phone",
		keywords: ["call", "contact", "mobile"],
	},
	link: { icon: Link, name: "Link", keywords: ["url", "connect", "chain"] },
	paperclip: {
		icon: Paperclip,
		name: "Paperclip",
		keywords: ["attach", "file", "document"],
	},

	// Media & Design
	image: {
		icon: Image,
		name: "Image",
		keywords: ["picture", "photo", "gallery"],
	},
	film: { icon: Film, name: "Film", keywords: ["movie", "video", "cinema"] },
	palette: {
		icon: Palette,
		name: "Palette",
		keywords: ["color", "design", "art"],
	},
	layers: {
		icon: Layers,
		name: "Layers",
		keywords: ["stack", "design", "levels"],
	},
	grid: { icon: Grid, name: "Grid", keywords: ["layout", "table", "organize"] },

	// Actions
	play: { icon: Play, name: "Play", keywords: ["start", "media", "video"] },
	save: { icon: Save, name: "Save", keywords: ["disk", "store", "keep"] },
	upload: {
		icon: Upload,
		name: "Upload",
		keywords: ["send", "up", "transfer"],
	},
	trash: { icon: Trash, name: "Trash", keywords: ["delete", "remove", "bin"] },
	shuffle: {
		icon: Shuffle,
		name: "Shuffle",
		keywords: ["random", "mix", "reorder"],
	},
	chevronright: {
		icon: ChevronRight,
		name: "Chevron Right",
		keywords: ["arrow", "next", "forward"],
	},
	list: { icon: List, name: "List", keywords: ["menu", "items", "organize"] },
	eye: { icon: Eye, name: "Eye", keywords: ["view", "see", "watch"] },
	thumbsup: {
		icon: ThumbsUp,
		name: "Thumbs Up",
		keywords: ["like", "approve", "good"],
	},
	battery: {
		icon: Battery,
		name: "Battery",
		keywords: ["power", "energy", "charge"],
	},
	volume: {
		icon: Volume,
		name: "Volume",
		keywords: ["sound", "audio", "speaker"],
	},
	home: { icon: Home, name: "Home", keywords: ["house", "main", "start"] },
};

export function getIconByKey(key: string): IconRegistryItem | null {
	return iconRegistry[key] || null;
}

export function searchIcons(query: string): Array<[string, IconRegistryItem]> {
	const lowercaseQuery = query.toLowerCase();
	return Object.entries(iconRegistry).filter(([key, item]) => {
		return (
			key.includes(lowercaseQuery) ||
			item.name.toLowerCase().includes(lowercaseQuery) ||
			item.keywords?.some((keyword) => keyword.includes(lowercaseQuery))
		);
	});
}

export function getAllIcons(): Array<[string, IconRegistryItem]> {
	return Object.entries(iconRegistry);
}
