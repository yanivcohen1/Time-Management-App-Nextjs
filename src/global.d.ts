declare module "*.css";

declare module "react-sticky-el" {
	import type { ComponentType, CSSProperties, ReactNode } from "react";

	export type StickyProps = {
		children?: ReactNode;
		className?: string;
		stickyClassName?: string;
		wrapperClassName?: string;
		style?: CSSProperties;
		stickyStyle?: CSSProperties;
		topOffset?: number;
		bottomOffset?: number;
		boundaryElement?: string | Element;
		scrollElement?: string | Element;
	};

	const Sticky: ComponentType<StickyProps>;

	export default Sticky;
}