import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeaderInfoBar } from "./header-info-bar";

const meta = {
	title: "Widgets/HeaderInfoBar",
	component: HeaderInfoBar,
	tags: ["autodocs"],
	args: {
		roomName: "room1",
		userName: "Alex",
		userImage: null,
	},
	argTypes: {
		roomName: { control: "text" },
		userName: { control: "text" },
		userImage: { control: "text" },
	},
} satisfies Meta<typeof HeaderInfoBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRoom: Story = {};

export const NoRoom: Story = {
	args: { roomName: null },
};

export const WithAvatar: Story = {
	args: {
		userImage: "https://avatars.githubusercontent.com/u/1?v=4",
	},
};

export const NoUser: Story = {
	args: { roomName: null, userName: null, userImage: null },
};
