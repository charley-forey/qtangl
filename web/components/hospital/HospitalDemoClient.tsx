"use client";

import OrCommandCenter from "@/components/hospital/OrCommandCenter";
import type { HospitalRosterNurse, Scenario } from "@/lib/hospital";

type HospitalDemoClientProps = {
  initialRoster: HospitalRosterNurse[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
};

export default function HospitalDemoClient(props: HospitalDemoClientProps) {
  return <OrCommandCenter {...props} />;
}
