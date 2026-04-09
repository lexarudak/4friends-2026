import type { Meta, StoryObj } from "@storybook/react";
import { Timer } from "./timer";

const meta: Meta<typeof Timer> = {
	title: "Widgets/Timer",
	component: Timer,
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof Timer>;

const inDays = (days: number) => {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d;
};

const inHours = (hours: number) => {
	const d = new Date();
	d.setHours(d.getHours() + hours);
	return d;
};

export const WorldCup2026: Story = {
	name: "World Cup 2026 Opening",
	args: {
		targetDate: new Date("2026-06-11T20:00:00"),
		message: "Next match — Group A · Opening",
		homeTeam: "Mexico",
		awayTeam: "USA",
	},
};

export const SoonMatch: Story = {
	name: "Match in a few hours",
	args: {
		targetDate: inHours(3),
		message: "Next match — Group B · Matchday 2",
		homeTeam: "Brazil",
		awayTeam: "Germany",
	},
};

export const Tomorrow: Story = {
	name: "Match tomorrow",
	args: {
		targetDate: inDays(1),
		message: "Next match — Quarter Final",
		homeTeam: "France",
		awayTeam: "Argentina",
	},
};

export const Expired: Story = {
	name: "Match already started",
	args: {
		targetDate: new Date("2020-01-01T00:00:00"),
		message: "Match in progress",
		homeTeam: "Spain",
		awayTeam: "England",
	},
};
