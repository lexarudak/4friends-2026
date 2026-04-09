import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta = {
	title: "Shared/Button",
	component: Button,
	tags: ["autodocs"],
	args: {
		children: "Button",
		color: "primary",
		isLoading: false,
		disabled: false,
	},
	argTypes: {
		color: {
			control: "select",
			options: ["neutral", "green", "primary", "yellow", "red"],
		},
		isLoading: { control: "boolean" },
		disabled: { control: "boolean" },
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { color: "primary" } };
export const Neutral: Story = { args: { color: "neutral" } };
export const Green: Story = { args: { color: "green" } };
export const Yellow: Story = { args: { color: "yellow" } };
export const Red: Story = { args: { color: "red" } };
export const Loading: Story = { args: { color: "primary", isLoading: true } };
export const Disabled: Story = { args: { color: "primary", disabled: true } };

export const AllColors: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
			{(["neutral", "primary", "green", "yellow", "red"] as const).map(
				(color) => (
					<Button key={color} color={color}>
						{color}
					</Button>
				)
			)}
		</div>
	),
};
