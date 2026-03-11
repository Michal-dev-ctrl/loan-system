import type { ReactNode } from "react";
import { RentalProvider } from "./RentalContext";

export default function RentalLayout({ children }: { children: ReactNode }) {
  return <RentalProvider>{children}</RentalProvider>;
}

