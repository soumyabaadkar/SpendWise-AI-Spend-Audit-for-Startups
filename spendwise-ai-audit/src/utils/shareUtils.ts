import { v4 as uuidv4 } from 'uuid';

export function generateAuditId(): string {
  return uuidv4();
}

export function getShareUrl(auditId: string): string {
  return `${window.location.origin}/report/${auditId}`;
}
