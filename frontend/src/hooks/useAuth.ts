import { useAuthContext } from "../context/AuthContext";

/**
 * Hook to access core authentication utilities, session context, active operator profile and status.
 */
export function useAuth() {
  return useAuthContext();
}
