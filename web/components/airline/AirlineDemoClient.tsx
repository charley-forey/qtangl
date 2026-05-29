"use client";

import OccCommandCenter from "./OccCommandCenter";
import type { AirlineCrewMember, AirlineFlight, Scenario } from "@/lib/airline";

type AirlineDemoClientProps = {
  initialCrew: AirlineCrewMember[];
  initialFlights: AirlineFlight[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
};

export default function AirlineDemoClient(props: AirlineDemoClientProps) {
  return <OccCommandCenter {...props} />;
}
