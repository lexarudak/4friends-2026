import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import styles from "./room-item.module.scss";
import { cn } from "@/utils/lib";

// Storybook preview — renders the visual shell without the server action form
const RoomItemPreview = ({
	roomId,
	isActive,
}: {
	roomId: string;
	isActive: boolean;
}) => (
	<button className={cn(styles.roomItem, { [styles.active]: isActive })}>
		{roomId}
	</button>
);

const meta = {
	title: "Widgets/RoomItem",
	component: RoomItemPreview,
	tags: ["autodocs"],
	args: {
		roomId: "room1",
		isActive: false,
	},
	argTypes: {
		isActive: { control: "boolean" },
		roomId: { control: "text" },
	},
	decorators: [
		(Story) => (
			<div style={{ maxWidth: 320, padding: 16 }}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof RoomItem>;

export default meta;
type Story = StoryObj<typeof meta>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStory = any;

export const Default: Story = {};

export const Active: Story = {
	args: { isActive: true },
};

export const List: AnyStory = {
	render: () => (
		<div
			style={{
				maxWidth: 320,
				padding: 16,
				display: "flex",
				flexDirection: "column",
				gap: 8,
			}}
		>
			<RoomItemPreview roomId="room1" isActive={false} />
			<RoomItemPreview roomId="room2" isActive={true} />
			<RoomItemPreview roomId="friends-forever" isActive={false} />
		</div>
	),
};
