import { notFound, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from "@/utils/theme";

import { QueryTable } from "@/components/queryTable";
import CreateMode from "@/components/mutationTable";
import Loading from "@/app/loading";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useTranslation } from "@/hooks/useTranslation";

function QueryPageContent() {
	const searchParams = useSearchParams();
	const q = searchParams?.get("q");
	const view = searchParams?.get("view") || (q !== 'q' ? q : null);
	const create = searchParams?.get("create");
	const id = searchParams?.get("id");
	const [validDataTypes, setValidDataTypes] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const isDesktop = useIsDesktop();
	const { t, dataTypes, navigation } = useTranslation();
	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);

	const pageTitle = (view && (typeof navigation[view] === 'string' ? navigation[view] : dataTypes[view]?.title)) || "Management Dashboard";

	useEffect(() => {
		document.title = pageTitle;
	}, [pageTitle]);

	useEffect(() => {
		const loadDataTypes = () => {
			try {
				setValidDataTypes(Object.keys(dataTypes || {}));
			} catch (error) {
				console.error(t("ui.error"), error);
				setValidDataTypes([]);
			} finally {
				setIsLoading(false);
			}
		};
		loadDataTypes();
	}, [dataTypes]);

	if (isLoading) return <Loading />;
	if (!view) return notFound();
	if (validDataTypes.length === 0 || !validDataTypes.includes(view)) return notFound();

	if (create === 'true' || id) {
		return <CreateMode slug="create" dataType={view} id={id || undefined} />;
	}

	return (
		<div style={{ flexGrow: 1, width: '100%', background: theme.bg, minHeight: '100vh', fontFamily: theme.fontFamily }} role="region">
			<div style={{ maxWidth: '1280px', margin: '0 auto', padding: isDesktop ? '32px 16px' : '0 16px' }}>
				<h1 style={{
					fontSize: theme.fontSizeHero,
					fontWeight: "800",
					marginTop: 0,
					marginBottom: "2rem",
					background: theme.brandGradient,
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					lineHeight: "1.2"
				}}>
					{pageTitle}
				</h1>
				<QueryTable dataType={view} />
			</div>
		</div>
	);
}

export default function QueryPage() {
	return (
		<Suspense fallback={<Loading />}>
			<QueryPageContent />
		</Suspense>
	);
}
