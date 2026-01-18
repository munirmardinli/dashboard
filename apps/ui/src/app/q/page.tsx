"use client"
import { notFound, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import { TodoTable } from "@/components/queryTable";
import CreateMode from "@/components/mutationTable";
import { ConfigAPI } from "@/utils/api";
import Loading from "@/app/loading";
import { useIsDesktop } from "@/hooks/useMediaQuery";

const titleMap: Record<string, string> = {
	privateTodos: "Privat Todos",
	workTodos: "Arbeit Todos",
	application: "Bewerbungen",
	expense: "Ausgaben",
	books: "Bücher",
	theory: "Theorie",
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
	privateJournal: "Privates Journal",
	schoolJournal: "Schulbegleitung",
	privatContact: "Privat Kontakte",
	workContact: "Arbeit Kontakte",
	dashy: "Dashy",
};

function QueryPageContent() {
	const searchParams = useSearchParams();
	const view = searchParams?.get("view");
	const create = searchParams?.get("create");
	const id = searchParams?.get("id");
	const [validDataTypes, setValidDataTypes] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const isDesktop = useIsDesktop();

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
				console.error("Failed to load data types:", error);
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
		<div style={{ flexGrow: 1, width: '100%' }} role="region">
			<div style={{ maxWidth: '1280px', margin: '0 auto', padding: isDesktop ? '32px 16px' : '16px 8px' }}>
				<TodoTable dataType={view} />
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
