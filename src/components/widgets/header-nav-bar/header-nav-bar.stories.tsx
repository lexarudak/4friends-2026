import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "next/link";
import { FwcLogoIcon } from "@/components/icons";
import { NAV_LINKS } from "./header-nav-bar.constants";
import { PAGES } from "@/utils/constants";
import { PageContainer } from "@/components/shared/page-container";
import styles from "./header-nav-bar.module.scss";

// Storybook preview — replaces the server-action logout with a no-op
const HeaderNavBarPreview = () => (
	<nav className={styles.bar}>
		<PageContainer className={styles.container}>
			<Link href={PAGES.HOME}>
				<FwcLogoIcon className={styles.logo} />
			</Link>
			<ul className={styles.navLinks}>
				{NAV_LINKS.map((link) => (
					<li key={link.href} className={styles.navItem}>
						<Link href={link.href}>{link.label}</Link>
					</li>
				))}
				<li className={styles.navItem}>
					<button className={styles.navBtn}>Logout</button>
				</li>
			</ul>
		</PageContainer>
	</nav>
);

const meta = {
	title: "Widgets/HeaderNavBar",
	component: HeaderNavBarPreview,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta<typeof HeaderNavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
