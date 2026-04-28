import type { Preview } from "@storybook/nextjs-vite";
import React, { useEffect } from "react";
import "../src/styles/globals.scss";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/600.css";
import "@fontsource/geist-mono/700.css";

function FontInjector({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		document.body.style.setProperty(
			"--font-geist-sans",
			"'Geist', system-ui, sans-serif"
		);
		document.body.style.setProperty(
			"--font-geist-mono",
			"'Geist Mono', monospace"
		);
	}, []);
	return <>{children}</>;
}

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: "todo",
		},
	},
	decorators: [
		(Story) => (
			<FontInjector>
				<Story />
			</FontInjector>
		),
	],
};

export default preview;
