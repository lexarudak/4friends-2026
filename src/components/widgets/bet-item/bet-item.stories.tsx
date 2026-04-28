import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BetItem } from "./bet-item";

const meta = {
	title: "Widgets/BetItem",
	component: BetItem,
	tags: ["autodocs"],
	args: {
		group: "B",
		homeTeam: "Spain",
		homeFlag: "🇪🇸",
		awayTeam: "Italy",
		awayFlag: "🇮🇹",
		betHome: 2,
		betAway: 0,
		time: "21:00",
		date: "15/06/26",
		status: "exact",
		result: { home: 2, away: 0, points: 3 },
	},
	argTypes: {
		status: {
			control: "select",
			options: ["exact", "win", "miss", "pending"],
		},
		betHome: { control: { type: "number", min: 0, max: 10 } },
		betAway: { control: { type: "number", min: 0, max: 10 } },
	},
	decorators: [
		(Story) => (
			<ul style={{ listStyle: "none", margin: 0, padding: 16, maxWidth: 900 }}>
				<Story />
			</ul>
		),
	],
} satisfies Meta<typeof BetItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Exact: Story = {
	args: {
		status: "exact",
		result: { home: 2, away: 0, points: 3 },
	},
};

export const Win: Story = {
	args: {
		status: "win",
		betHome: 3,
		betAway: 0,
		result: { home: 1, away: 0, points: 1 },
	},
};

export const Miss: Story = {
	args: {
		status: "miss",
		betHome: 2,
		betAway: 0,
		result: { home: 0, away: 1, points: 0 },
	},
};

export const Pending: Story = {
	args: {
		group: "D",
		homeTeam: "Argentina",
		homeFlag: "🇦🇷",
		awayTeam: "England",
		awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
		betHome: 1,
		betAway: 2,
		time: "15:00",
		date: "20/06/26",
		status: "pending",
		result: null,
	},
};

export const NoResult: Story = {
	name: "Without result column",
	args: {
		status: "exact",
		result: undefined,
	},
};

export const AllStates: Story = {
	name: "All states",
	render: () => (
		<ul
			style={{
				listStyle: "none",
				margin: 0,
				padding: 16,
				maxWidth: 900,
				display: "flex",
				flexDirection: "column",
				gap: 6,
			}}
		>
			<BetItem
				group="B"
				homeTeam="Spain"
				homeFlag="🇪🇸"
				awayTeam="Italy"
				awayFlag="🇮🇹"
				betHome={2}
				betAway={0}
				time="21:00"
				date="15/06/26"
				status="exact"
				result={{ home: 2, away: 0, points: 3 }}
			/>
			<BetItem
				group="A"
				homeTeam="Germany"
				homeFlag="🇩🇪"
				awayTeam="Scotland"
				awayFlag="🏴󠁧󠁢󠁳󠁣󠁴󠁿"
				betHome={3}
				betAway={0}
				time="18:00"
				date="14/06/26"
				status="win"
				result={{ home: 1, away: 0, points: 1 }}
			/>
			<BetItem
				group="C"
				homeTeam="France"
				homeFlag="🇫🇷"
				awayTeam="Brazil"
				awayFlag="🇧🇷"
				betHome={2}
				betAway={0}
				time="21:00"
				date="16/06/26"
				status="miss"
				result={{ home: 0, away: 1, points: 0 }}
			/>
			<BetItem
				group="D"
				homeTeam="Argentina"
				homeFlag="🇦🇷"
				awayTeam="England"
				awayFlag="🏴󠁧󠁢󠁥󠁮󠁧󠁿"
				betHome={1}
				betAway={2}
				time="15:00"
				date="20/06/26"
				status="pending"
				result={null}
			/>
		</ul>
	),
};
