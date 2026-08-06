// lib/apollo-client/notification.ts
import { makeVar } from "@apollo/client";

export type NotificationSeverity = "success" | "error" | "info" | "warning";

export interface Notification {
  id: number;
  message: string;
  severity: NotificationSeverity;
}

export const notificationVar = makeVar<Notification | null>(null);

let notificationId = 0;

export function notify(message: string, severity: NotificationSeverity = "info") {
  notificationVar({ id: ++notificationId, message, severity });
}