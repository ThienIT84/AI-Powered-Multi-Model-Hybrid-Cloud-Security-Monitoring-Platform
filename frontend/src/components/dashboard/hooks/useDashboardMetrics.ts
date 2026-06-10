import { useMemo } from "react";
import { Alert, TrafficData } from "../../../types";
import { DashboardService } from "../services/dashboard.service";
import {
  DashboardMetrics,
  FusionOverviewMetrics,
  SecurityPostureMetrics,
  OpenCasesMetrics,
  SeverityDistributionItem
} from "../types/dashboard.types";

export function useDashboardMetrics(alerts: Alert[], traffic: TrafficData[]) {
  const metrics = useMemo(() => {
    return DashboardService.getMetrics(alerts, traffic);
  }, [alerts, traffic]);

  const fusionOverview = useMemo(() => {
    return DashboardService.getFusionOverview(alerts);
  }, [alerts]);

  const securityPosture = useMemo(() => {
    return DashboardService.getSecurityPosture(alerts);
  }, [alerts]);

  const severityDistribution = useMemo(() => {
    return DashboardService.getSeverityDistribution(alerts);
  }, [alerts]);

  const openCasesSummary = useMemo(() => {
    return DashboardService.getOpenCasesSummary(alerts);
  }, [alerts]);

  return {
    metrics,
    fusionOverview,
    securityPosture,
    severityDistribution,
    openCasesSummary
  };
}
