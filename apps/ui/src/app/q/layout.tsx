import { Navigation } from "@/app/default";
import { ReactNode } from "react";

export default function QueryLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navigation />
      {children}</>
  );
}
