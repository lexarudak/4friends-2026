"use client";

import Link from "next/link";
import { useMemo, type ComponentProps } from "react";
import { useSearchParams } from "next/navigation";

type ReadonlyURLSearchParams = ReturnType<typeof useSearchParams>;

type LinkProps = ComponentProps<typeof Link>;

const PRESERVED_QUERY_KEYS = ["from", "to"] as const;

function isInternalHref(href: LinkProps["href"]): href is string {
	return typeof href === "string" && href.startsWith("/");
}

function withPreservedQuery(
	href: string,
	searchParams: ReadonlyURLSearchParams
): string {
	const params = new URLSearchParams();

	for (const key of PRESERVED_QUERY_KEYS) {
		const value = searchParams.get(key);
		if (value) params.set(key, value);
	}

	if ([...params.keys()].length === 0) return href;

	const [path, hashPart] = href.split("#", 2);
	const [pathname, queryPart] = path.split("?", 2);
	const merged = new URLSearchParams(queryPart ?? "");

	for (const [key, value] of params.entries()) {
		if (!merged.has(key)) merged.set(key, value);
	}

	const query = merged.toString();
	const hash = hashPart ? `#${hashPart}` : "";
	return query ? `${pathname}?${query}${hash}` : `${pathname}${hash}`;
}

export function PreservedQueryLink({ href, ...props }: LinkProps) {
	const searchParams = useSearchParams();

	const finalHref = useMemo(() => {
		if (!isInternalHref(href)) return href;
		return withPreservedQuery(href, searchParams);
	}, [href, searchParams]);

	return <Link href={finalHref} {...props} />;
}
