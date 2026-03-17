/// <reference types="vite/client" />
import { glClientSDK } from '@gitlab/application-sdk-browser';

// Initialize the GitLab Browser SDK
// Note: In a real application, appId and host would come from environment variables.
// For this hackathon project, we use placeholder values or env vars if available.
const appId = import.meta.env.VITE_GITLAB_APP_ID || 'gitlab-hackathon-app-id';
const host = import.meta.env.VITE_GITLAB_HOST || 'https://collector.gitlab.com';

export const glClient = glClientSDK({
  appId,
  host,
  hasCookieConsent: true,
});

export const trackCliCommand = (command: string, args: string[]) => {
  try {
    glClient.track('cli_command_executed', {
      command,
      args: args.join(' ')
    });
  } catch (error) {
    console.error('Failed to track CLI command:', error);
  }
};

export const trackPageView = (pageName: string) => {
  try {
    glClient.page({
      title: pageName
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

export const identifyUser = (userId: string, attributes: Record<string, any>) => {
  try {
    glClient.identify(userId, attributes);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
};
