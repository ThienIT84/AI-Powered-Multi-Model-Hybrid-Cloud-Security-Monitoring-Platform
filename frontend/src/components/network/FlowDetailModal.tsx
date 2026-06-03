import React from "react";
import { NetworkLog } from "../network/NetworkConfig";
import { FlowDetailPanel } from "./FlowDetailPanel";

interface FlowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: NetworkLog | null;
  onActionFeedback?: (message: { type: "success" | "warning"; text: string } | null) => void;
}

export const FlowDetailModal: React.FC<FlowDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  log,
  onActionFeedback
}) => {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" id="flow-detail-modal-root">
      {/* Backdrop click handles close */}
      <div 
        className="absolute inset-0 transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content Box */}
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10 custom-scrollbar rounded-lg shadow-2xl"
        id="flow-detail-modal-container"
      >
        <FlowDetailPanel 
          log={log} 
          onClose={onClose} 
          onActionFeedback={onActionFeedback} 
        />
      </div>
    </div>
  );
};
