import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Munir Lab - Quittung",
  description: "Personal Dashboard",
};

export default function QuittungLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
