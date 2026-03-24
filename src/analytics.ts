/// <reference types="vite/client" />

// GitLab Product Analytics is disabled as per user request.
// These functions are now no-ops to avoid breaking existing call sites.

export const glClient = {
  track: () => {},
  page: () => {},
  identify: () => {},
};

export const trackCliCommand = (command: string, args: string[]) => {
  // No-op
};

export const trackPageView = (pageName: string) => {
  // No-op
};

export const identifyUser = (userId: string, attributes: Record<string, any>) => {
  // No-op
};
