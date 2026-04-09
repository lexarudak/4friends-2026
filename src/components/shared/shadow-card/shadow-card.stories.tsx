import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShadowCard } from "./shadow-card";

const meta = {
	title: "Shared/ShadowCard",
	component: ShadowCard,
	tags: ["autodocs"],
	args: {
		children: "Card content",
		color: "neutral",
	},
	argTypes: {
		color: {
			control: "select",
			options: ["neutral", "primary", "green", "yellow", "red", "alpha"],
		},
	},
	decorators: [
		(Story) => (
			<div style={{ padding: "24px" }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ShadowCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { color: "neutral" } };
export const Primary: Story = { args: { color: "primary" } };
export const Green: Story = { args: { color: "green" } };
export const Yellow: Story = { args: { color: "yellow" } };
export const Red: Story = { args: { color: "red" } };
export const Alpha: Story = { args: { color: "alpha" } };

export const AllColors: Story = {
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(3, 160px)",
				gap: "24px",
				padding: "24px",
			}}
		>
			{(
				["neutral", "primary", "green", "yellow", "red", "alpha"] as const
			).map((color) => (
				<ShadowCard key={color} color={color}>
					<div style={{ padding: "16px", fontWeight: 500 }}>{color}</div>
				</ShadowCard>
			))}
		</div>
	),
};
