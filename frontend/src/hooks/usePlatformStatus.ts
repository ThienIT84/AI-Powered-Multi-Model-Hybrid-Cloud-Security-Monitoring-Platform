import { useCallback, useEffect, useState } from "react";
import { PlatformStatus, SocketStatus } from "../types/platform";
import { getPlatformStatus } from "../services/platform.service";
import { appConfig } from "../config";

function initialStatus(socketStatus: SocketStatus): PlatformStatus {
  return {
    socketStatus,
    dataMode: appConfig.dataMode,
    dataSourcesOnline: null,
    dataSourcesTotal: null,
    modelHealthy: null,
    modelTotal: null,
    eventRatePerSecond: null,
    lastIngestAt: null,
    lastUiRefreshAt: new Date().toISOString(),
    lastError: null,
  };
}

export function usePlatformStatus(socketStatus: SocketStatus) {
  const [status, setStatus] = useState<PlatformStatus>(() => initialStatus(socketStatus));
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await getPlatformStatus(socketStatus);
    setStatus(next);
    setLoading(false);
  }, [socketStatus]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, appConfig.dataMode === "live" ? 15000 : 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return { status, loading, refresh };
}

