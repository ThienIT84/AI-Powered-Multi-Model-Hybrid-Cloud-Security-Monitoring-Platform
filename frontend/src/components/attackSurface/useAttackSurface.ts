import { useState, useEffect } from "react";
import { AssetNode, CorrelationItem, AwsServiceItem } from "./types";
import {
  INITIAL_ASSETS,
  INITIAL_CORRELATION,
  INITIAL_AWS_SERVICES,
  STREAM_POOL
} from "./mockData";

export function useAttackSurface() {
  const [assets, setAssets] = useState<AssetNode[]>(INITIAL_ASSETS);
  const [awsServices, setAwsServices] = useState<AwsServiceItem[]>(INITIAL_AWS_SERVICES);
  const [correlations, setCorrelations] = useState<CorrelationItem[]>(INITIAL_CORRELATION);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<string>("path-1");
  const [timeRange, setTimeRange] = useState<"24H" | "7D" | "30D" | "90D">("30D");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(2);

  useEffect(() => {
    // Increment timer every second
    const timerId = setInterval(() => {
      setSecondsSinceUpdate((prev) => prev + 1);
    }, 1000);

    // Dynamic state updater every 4.5 seconds (consistent with existing app)
    const simulatorId = setInterval(() => {
      setSecondsSinceUpdate(0); // Reset update timer

      // 1. Shift Risk Score in random asset
      setAssets((prevAssets) => {
        const randomIndex = Math.floor(Math.random() * prevAssets.length);
        return prevAssets.map((asset, idx) => {
          if (idx === randomIndex) {
            const shift = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const newScore = Math.min(99, Math.max(12, asset.riskScore + shift));
            let newLevel: "Low" | "Medium" | "High" | "Critical" = "Low";
            if (newScore >= 90) newLevel = "Critical";
            else if (newScore >= 70) newLevel = "High";
            else if (newScore >= 40) newLevel = "Medium";

            return {
              ...asset,
              riskScore: newScore,
              exposureLevel: newLevel,
              connections: asset.connections + Math.floor(Math.random() * 8) - 1
            };
          }
          return asset;
        });
      });

      // 2. Prepend a new live Correlation alarm from the stream log pool
      setCorrelations((prevCorrs) => {
        const randomItem = STREAM_POOL[Math.floor(Math.random() * STREAM_POOL.length)];
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const newLog: CorrelationItem = {
          id: `corr-${Date.now()}`,
          time: timeString,
          asset: randomItem.asset || "unknown-node",
          exposure: randomItem.exposure,
          aiEvidence: randomItem.aiEvidence,
          suricata: randomItem.suricata,
          fusionResult: randomItem.fusionResult,
          severity: randomItem.severity
        };

        return [newLog, ...prevCorrs.slice(0, 6)]; // Truncate at max 7 items
      });

      // 3. Shift AWS compliance indicators slightly
      setAwsServices((prev) =>
        prev.map((s) => {
          const shift = Math.floor(Math.random() * 3) - 1; // -1 to +1
          const newScore = Math.min(98, Math.max(10, s.exposureScore + shift));
          let blockLevel = s.riskLevel;
          if (newScore >= 90) blockLevel = "Critical";
          else if (newScore >= 70) blockLevel = "High";
          return {
            ...s,
            exposureScore: newScore,
            riskLevel: blockLevel
          };
        })
      );
    }, 4500);

    return () => {
      clearInterval(timerId);
      clearInterval(simulatorId);
    };
  }, []);

  const activeAsset = assets.find((a) => a.id === selectedAssetId) || null;

  const filteredAssetsTable = assets.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageExposureMultiplier = Math.round(
    assets.reduce((sum, current) => sum + current.riskScore, 0) / assets.length
  );

  return {
    assets,
    awsServices,
    correlations,
    selectedAssetId,
    setSelectedAssetId,
    selectedPathId,
    setSelectedPathId,
    timeRange,
    setTimeRange,
    searchTerm,
    setSearchTerm,
    secondsSinceUpdate,
    activeAsset,
    filteredAssetsTable,
    averageExposureMultiplier
  };
}
