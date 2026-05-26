import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface FloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  anchorId?: string;
}

export function FloatingPanel({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
}: FloatingPanelProps) {
  // Use a backdrop to detect click outside
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for click-outside detection */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed right-6 top-16 z-50 w-full max-w-105 bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-100px)]",
              className
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">{title}</h3>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
