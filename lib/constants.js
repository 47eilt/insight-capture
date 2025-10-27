/**
 * Application constants
 */

export const APP_NAME = 'Insight Capture';
export const APP_TAGLINE = 'AI-powered insights from your team';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  INSIGHTS: '/insights',
  TEAM: '/team',
};

export const MESSAGES = {
  ERROR: {
    GENERIC: 'An error occurred. Please try again.',
    DELETE_FAILED: 'Failed to delete insight',
    LOAD_FAILED: 'Failed to load data',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVITE_FAILED: 'Failed to send invite. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
  },
  SUCCESS: {
    DELETED: 'Successfully deleted',
    INVITE_SENT: 'Invitation email sent!',
    INVITE_SAVED: 'Invite saved! The user can now sign up with this email.',
  },
  INFO: {
    NO_INSIGHTS: 'No insights yet',
    NO_INSIGHTS_DESC: 'Ideas will appear here once insights are generated',
    LOADING: 'Loading...',
    LOADING_INSIGHTS: 'Loading insights...',
  },
};

export const DAYS_IN_WEEK = 7;

export const TABLE_COLUMNS = {
  SCREENSHOTS: 'Screenshots',
  TEXT: 'Text',
  PAGE: 'Page',
  URL: 'URL',
  CREATOR: 'Creator',
  CREATED: 'Created',
  ACTIONS: 'Actions',
};

export const SCREENSHOT_PREVIEW_LIMIT = 3;

export const PASSWORD_MIN_LENGTH = 6;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
};
