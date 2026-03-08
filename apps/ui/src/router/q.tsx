import { notFound, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from "@/utils/theme";

import { QueryTable } from "@/components/queryTable";
import CreateMode from "@/components/mutationTable";
import { ConfigAPI } from "@/utils/api";
import Loading from "@/app/loading";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useI18nStore } from "@/stores/i18nStore";

const titleMap: Record<string, string> = {
	expense: "Ausgaben",
	hobbys: "Hobbys",
	work: "Arbeit Kalender",
	sonstiges: "Sonstiges",
	reminiszenz: "Reminiszenz",
	nomination: "Nomination",
	doctorsAppointment: "Arzttermin",
	rendezvous: "Rendezvous",
	informatica: "Informatik Vokabular",
	verba: "Verben",
	englisch: "Englisch Vokabular",
	idiotisms: "Idiotismen",
	adjectiva: "Adjektive",
	it: "IT Passwörter",
	homelab: "Homelab Passwörter",
	mail: "Mail Passwörter",
	mix: "Mix Passwörter",
	shopping: "Shopping Passwörter",
	socialMedia: "Social Media Passwörter",
	study: "Study Passwörter",
	works: "Arbeit Passwörter",
	privatContact: "Privat Kontakte",
	workContact: "Arbeit Kontakte",
	dashy: "Dashy",
};

function QueryPageContent() {
	const searchParams = useSearchParams();
	const q = searchParams?.get("q");
	const view = searchParams?.get("view") || (q !== 'q' ? q : null);
	const create = searchParams?.get("create");
	const id = searchParams?.get("id");
	const [validDataTypes, setValidDataTypes] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const isDesktop = useIsDesktop();
	const { t } = useI18nStore();
	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);

	useEffect(() => {
		if (view && titleMap[view]) {
			document.title = `${titleMap[view]}`;
		} else {
			document.title = "Management Dashboard";
		}
	}, [view]);

	useEffect(() => {
		const loadDataTypes = async () => {
			try {
				const config = await ConfigAPI.getFullConfig();
				setValidDataTypes(Object.keys(config.dataTypes || {}));
			} catch (error) {
				console.error(t("ui.error"), error);
				setValidDataTypes([]);
			} finally {
				setIsLoading(false);
			}
		};
		loadDataTypes();
	}, []);

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
					{view && titleMap[view] ? titleMap[view] : "Management Dashboard"}
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
