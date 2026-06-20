import { useMemo } from "react";
import { DashboardService } from "../services/dashboard.service";
import { PlatformHealthStatus } from "../types/dashboard.types";

export function usePlatformHealth(isConnected: boolean): PlatformHealthStatus {
  return useMemo(() => {
    return DashboardService.getPlatformHealth(isConnected);
  }, [isConnected]);
}
