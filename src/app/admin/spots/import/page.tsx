import { Suspense } from "react";
import { ImportSpotsForm } from "@/components/admin/ImportSpotsForm";

export default function ImportSpotsPage() {
  return <Suspense fallback={null}><ImportSpotsForm /></Suspense>;
}
