import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CloseButton } from "./close-button";

const withCard = (Story: React.FC) => (
	<div
		style={{
			position: "relative",
			width: 240,
			height: 140,
			borderRadius: 12,
			background: "var(--color-primary-800)",
			padding: 16,
			color: "#fff",
		}}
	>
		<span style={{ fontSize: 14 }}>Card content</span>
		<Story />
	</div>
);

const meta = {
	title: "Shared/CloseButton",
	component: CloseButton,
	tags: ["autodocs"],
	decorators: [withCard],
	args: {},
} satisfies Meta<typeof CloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AsButton: Story = {
	args: {
		onClick: () => alert("closed"),
	},
};

export const AsLink: Story = {
	args: {
		linkArgs: { href: "/" },
	},
};
