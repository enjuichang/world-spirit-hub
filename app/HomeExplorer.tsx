"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getLocation } from "./data";
import { SpiritExplorer } from "./SpiritExplorer";

function QueryAwareSpiritExplorer() {
  const searchParams = useSearchParams();
  const requestedDistillery = searchParams.get("distillery");
  const initialDistilleryId = requestedDistillery && getLocation(requestedDistillery)
    ? requestedDistillery
    : undefined;

  return <SpiritExplorer initialDistilleryId={initialDistilleryId} />;
}

export function HomeExplorer() {
  return (
    <Suspense fallback={<SpiritExplorer />}>
      <QueryAwareSpiritExplorer />
    </Suspense>
  );
}
