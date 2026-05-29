"use client";

import type { EvFleetCharger, EvFleetStop, EvFleetVehicle, Scenario } from "@/lib/ev-fleet";

import DepotCommandCenter from "./DepotCommandCenter";

export default function EvFleetDemoClient(props: {
  initialVehicles: EvFleetVehicle[];
  initialStops: EvFleetStop[];
  initialChargers: EvFleetCharger[];
  initialScenarios: Scenario[];
  sitePowerCapKw: number;
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
}) {
  return <DepotCommandCenter {...props} />;
}
