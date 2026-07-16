import { Alert, TrafficData, Severity } from "../../../types";
import {
  DashboardMetrics,
  FusionOverviewMetrics,
  SecurityPostureMetrics,
  OpenCasesMetrics,
  SeverityDistributionItem
} from "../types/dashboard.types";

export class DashboardService {
  /**
   * Calculates overall dashboard metrics from live alerts stream and traffic history
   */
  static getMetrics(alerts: Alert[], traffic: TrafficData[]): DashboardMetrics {
    const totalNetworkFlows = traffic.reduce((sum, item) => sum + (item.flows || 0), 0);
    const totalFusionAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.severity === Severity.CRITICAL).length;
    const observedDestinations = new Set(alerts.map((alert) => alert.destinationIp).filter(Boolean)).size;
    const cloudResourceIds = new Set(alerts.map((alert) => alert.resourceId).filter(Boolean));
    const hasCloudMetadata = alerts.some((alert) => alert.cloudProvider || alert.resourceId || alert.resourceType);

    return {
      totalNetworkFlows,
      totalFusionAlerts,
      criticalAlerts,
      openCases: null,
      observedDestinations,
      cloudAssets: hasCloudMetadata ? cloudResourceIds.size : null,
      threatIntelMatches: null,
    };
  }

  /**
   * Standard platform health aggregation of core SOC stack services
   */
  /**
   * Aggregated Fusion Engine scoring & accuracy
   */
  static getFusionOverview(alerts: Alert[]): FusionOverviewMetrics {
    const fusionAlerts24h = alerts.filter((alert) => Boolean(alert.aiDecision.fusion)).length;
    
    // Compute agreement and reduction based on alert confidence values
    let totalConf = 0;
    let agreementCount = 0;
    alerts.forEach(a => {
      totalConf += a.confidenceScore;
      if ((a.aiDecision.fusion?.contributors?.length ?? 0) > 1) {
        agreementCount++;
      }
    });

    const averageConfidence = alerts.length ? Math.round((totalConf / alerts.length) * 100) : null;
    const fusionEvaluated = alerts.filter((alert) => Boolean(alert.aiDecision.fusion)).length;
    const aiAgreementRate = fusionEvaluated ? Math.round((agreementCount / fusionEvaluated) * 100) : null;

    return {
      fusionAlerts24h,
      aiAgreementRate,
      falsePositiveReduction: null,
      averageConfidence
    };
  }

  /**
   * Security Posture risk indicators (0-100 gauge data)
   */
  static getSecurityPosture(alerts: Alert[]): SecurityPostureMetrics {
    const averageRisk = (items: Alert[]) => items.length
      ? Math.round(items.reduce((sum, alert) => sum + alert.riskScore, 0) / items.length)
      : null;
    const networkAlerts = alerts.filter((alert) => alert.eventType === "network_flow" || alert.zeekData.service || alert.zeekData.origPkts !== undefined);
    const cloudAlerts = alerts.filter((alert) => alert.cloudProvider || alert.resourceId || alert.resourceType);
    const overallRisk = averageRisk(alerts);
    const networkRisk = averageRisk(networkAlerts);
    const endpointRisk = averageRisk(alerts.filter((alert) => Boolean(alert.destinationIp)));
    const cloudRisk = averageRisk(cloudAlerts);

    return {
      overallRisk,
      networkRisk,
      endpointRisk,
      cloudRisk
    };
  }

  /**
   * Threat Severity Distribution (24h)
   */
  static getSeverityDistribution(alerts: Alert[]): SeverityDistributionItem[] {
    const counts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0
    };

    alerts.forEach(a => {
      const sev = a.severity;
      if (sev === Severity.CRITICAL) {
        counts.Critical++;
      } else if (sev === Severity.HIGH) {
        counts.High++;
      } else if (sev === Severity.MEDIUM) {
        counts.Medium++;
      } else {
        counts.Low++;
      }
    });

    const total = counts.Critical + counts.High + counts.Medium + counts.Low;

    return [
      {
        name: "Critical",
        value: counts.Critical,
        percentage: total ? Math.round((counts.Critical / total) * 100) : 0,
        trend: null,
      },
      {
        name: "High",
        value: counts.High,
        percentage: total ? Math.round((counts.High / total) * 100) : 0,
        trend: null,
      },
      {
        name: "Medium",
        value: counts.Medium,
        percentage: total ? Math.round((counts.Medium / total) * 100) : 0,
        trend: null,
      },
      {
        name: "Low",
        value: counts.Low,
        percentage: total ? Math.round((counts.Low / total) * 100) : 0,
        trend: null,
      }
    ];
  }

  /**
   * Open cases summary SLA conformance metrics
   */
  static getOpenCasesSummary(alerts: Alert[]): OpenCasesMetrics {
    return {
      open: null,
      inProgress: null,
      resolvedToday: null,
      slaCompliance: null,
    };
  }
}
