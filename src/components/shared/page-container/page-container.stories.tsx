import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageContainer } from "./page-container";

const meta = {
	title: "Shared/PageContainer",
	component: PageContainer,
	tags: ["autodocs"],
	args: {
		children: "Page content goes here",
	},
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithContent: Story = {
	render: () => (
		<PageContainer>
			<h2 style={{ margin: 0 }}>Heading</h2>
			<p style={{ margin: "8px 0 0" }}>Some body text inside the container.</p>
		</PageContainer>
	),
};
