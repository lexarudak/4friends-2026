import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "./section";

const meta = {
	title: "Shared/Section",
	component: Section,
	tags: ["autodocs"],
	args: {
		children: "Section content goes here",
	},
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithContent: Story = {
	render: () => (
		<Section>
			<h3 style={{ margin: 0 }}>Section title</h3>
			<p style={{ margin: "8px 0 0" }}>Content inside the section.</p>
		</Section>
	),
};
