import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Safe performance.measure and performance.mark guards for sandboxed / iframe environments
if (typeof window !== "undefined" && window.performance) {
  const originalMeasure = window.performance.measure;
  const originalMark = window.performance.mark;

  if (typeof originalMeasure === "function") {
    window.performance.measure = function (name, startMarkOrOptions, endMark) {
      try {
        let options = startMarkOrOptions;
        if (options && typeof options === "object") {
          try {
            structuredClone({ detail: (options as any).detail });
          } catch {
            options = { ...(options as any) };
            delete (options as any).detail;
          }
        }
        return originalMeasure.call(window.performance, name, options, endMark);
      } catch (e) {
        try {
          return originalMeasure.call(
            window.performance,
            typeof name === "string" ? name : "measure",
            typeof startMarkOrOptions === "string" ? startMarkOrOptions : undefined,
            typeof endMark === "string" ? endMark : undefined
          );
        } catch {
          return {
            name: typeof name === "string" ? name : "measure",
            entryType: "measure",
            startTime: 0,
            duration: 0,
            toJSON: () => ({})
          } as any;
        }
      }
    };
  }

  if (typeof originalMark === "function") {
    window.performance.mark = function (name, options) {
      try {
        let opt = options;
        if (opt && typeof opt === "object") {
          try {
            structuredClone({ detail: (opt as any).detail });
          } catch {
            opt = { ...(opt as any) };
            delete (opt as any).detail;
          }
        }
        return originalMark.call(window.performance, name, opt);
      } catch (e) {
        try {
          return originalMark.call(window.performance, typeof name === "string" ? name : "mark");
        } catch {
          return {
            name: typeof name === "string" ? name : "mark",
            entryType: "mark",
            startTime: 0,
            duration: 0,
            toJSON: () => ({})
          } as any;
        }
      }
    };
  }
}

import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
