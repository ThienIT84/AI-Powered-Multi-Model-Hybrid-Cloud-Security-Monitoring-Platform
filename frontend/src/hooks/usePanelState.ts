import { useState, useCallback } from 'react';

export function usePanelState() {
  const [activePanel, setActivePanel] = useState<null | 'alerts' | 'settings'>(null);

  const openPanel = useCallback((panel: 'alerts' | 'settings') => {
    setActivePanel(prev => prev === panel ? null : panel);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  return {
    activePanel,
    openPanel,
    closePanel,
    isAlertsOpen: activePanel === 'alerts',
    isSettingsOpen: activePanel === 'settings',
  };
}
