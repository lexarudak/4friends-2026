"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, persistLocaleCookie, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/utils/lib";
import styles from "./language-switcher.module.scss";

export function LanguageSwitcher({ className }: { className?: string }) {
	const { locale } = useI18n();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const setLocale = (next: Locale) => {
		if (next === locale) return;
		persistLocaleCookie(next);
		// Re-render server components with the new cookie.
		startTransition(() => router.refresh());
	};

	return (
		<div
			className={cn(styles.root, className)}
			data-pending={isPending || undefined}
		>
			{locales.map((l) => (
				<button
					key={l}
					type="button"
					className={cn(styles.option, locale === l && styles.active)}
					onClick={() => setLocale(l)}
					aria-pressed={locale === l}
				>
					{l.toUpperCase()}
				</button>
			))}
		</div>
	);
}
