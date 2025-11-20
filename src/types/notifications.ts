// Notification types enum - matches database CHECK constraint
// This provides type safety and prevents mismatches between code and database

export const NOTIFICATION_TYPES = {
  QUOTE_UPDATE: 'quote_update',
  JOB_UPDATE: 'job_update',
  REVIEW_REQUEST: 'review_request',
  GENERAL: 'general',
  LOYALTY: 'loyalty',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// Type guard to validate notification types at runtime
export const isValidNotificationType = (type: string): type is NotificationType => {
  return Object.values(NOTIFICATION_TYPES).includes(type as NotificationType);
};
