// WEBHOOKS & VERSIONING SERVICE
// Features 5, 8, 9: Webhooks/Integrations + Versioning + Collaborative Editing

import { Form, FormResponse } from '../types';

// WEBHOOK CONFIGURATION
export interface WebhookConfig {
  id: string;
  formId: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  headers?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export type WebhookEvent = 'form.submitted' | 'form.updated' | 'form.deleted' | 'response.created' | 'response.updated';

// WEBHOOK MANAGEMENT
const webhooks: Map<string, WebhookConfig> = new Map();

export const createWebhook = (formId: string, url: string, events: WebhookEvent[]): WebhookConfig => {
  const webhook: WebhookConfig = {
    id: 'webhook_' + Math.random().toString(36).substr(2, 9),
    formId,
    url,
    events,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  webhooks.set(webhook.id, webhook);
  return webhook;
};

export const getWebhooks = (formId: string): WebhookConfig[] => {
  return Array.from(webhooks.values()).filter(w => w.formId === formId);
};

export const updateWebhook = (webhookId: string, updates: Partial<WebhookConfig>): WebhookConfig | null => {
  const webhook = webhooks.get(webhookId);
  if (!webhook) return null;
  const updated = { ...webhook, ...updates, updatedAt: Date.now() };
  webhooks.set(webhookId, updated);
  return updated;
};

export const deleteWebhook = (webhookId: string): boolean => {
  return webhooks.delete(webhookId);
};

// TRIGGER WEBHOOK
export const triggerWebhook = async (event: WebhookEvent, formId: string, payload: any): Promise<void> => {
  const formWebhooks = getWebhooks(formId).filter(w => w.isActive && w.events.includes(event));
  
  for (const webhook of formWebhooks) {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bravo-Event': event,
          'X-Bravo-Timestamp': new Date().toISOString(),
          ...webhook.headers
        },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          formId,
          payload
        })
      });
      console.log(`Webhook ${webhook.id} triggered: ${response.status}`);
    } catch (err) {
      console.error(`Failed to trigger webhook ${webhook.id}:`, err);
    }
  }
};

// INTEGRATION WITH THIRD-PARTY SERVICES
export const integrateWithZapier = (formId: string, zapierUrl: string): WebhookConfig => {
  return createWebhook(formId, zapierUrl, ['form.submitted', 'response.created']);
};

export const integrateWithMake = (formId: string, makeUrl: string): WebhookConfig => {
  return createWebhook(formId, makeUrl, ['form.submitted', 'response.created']);
};

export const sendToIntegration = async (integrationUrl: string, formData: any): Promise<boolean> => {
  try {
    const response = await fetch(integrationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return response.ok;
  } catch (err) {
    console.error('Integration request failed:', err);
    return false;
  }
};

// VERSIONING SYSTEM
export interface FormVersion {
  id: string;
  formId: string;
  version: number;
  title: string;
  description: string;
  elements: any[];
  theme: any;
  createdAt: number;
  createdBy: string;
  changeDescription: string;
}

const formVersions: Map<string, FormVersion[]> = new Map();

export const createFormVersion = (form: Form, userId: string, changeDescription: string): FormVersion => {
  const versions = formVersions.get(form.id) || [];
  const version: FormVersion = {
    id: 'v_' + Math.random().toString(36).substr(2, 9),
    formId: form.id,
    version: versions.length + 1,
    title: form.title || '',
    description: form.description || '',
    elements: form.elements || [],
    theme: form.theme,
    createdAt: Date.now(),
    createdBy: userId,
    changeDescription
  };
  versions.push(version);
  formVersions.set(form.id, versions);
  return version;
};

export const getFormVersions = (formId: string): FormVersion[] => {
  return formVersions.get(formId) || [];
};

export const getFormVersion = (formId: string, versionNumber: number): FormVersion | null => {
  const versions = formVersions.get(formId) || [];
  return versions.find(v => v.version === versionNumber) || null;
};

export const restoreFormVersion = (formId: string, versionNumber: number): Form | null => {
  const version = getFormVersion(formId, versionNumber);
  if (!version) return null;
  return {
    id: formId,
    title: version.title,
    description: version.description,
    elements: version.elements,
    theme: version.theme,
    teamId: '',
    status: 'draft',
    createdAt: version.createdAt,
    updatedAt: Date.now(),
    collaborators: []
  };
};

// COLLABORATIVE EDITING
export interface CollaborationSession {
  id: string;
  formId: string;
  users: { userId: string; userName: string; isActive: boolean; lastSeen: number }[];
  changes: ChangeLog[];
  createdAt: number;
}

export interface ChangeLog {
  id: string;
  userId: string;
  fieldId: string;
  action: 'add' | 'update' | 'delete';
  before: any;
  after: any;
  timestamp: number;
}

const collaborationSessions: Map<string, CollaborationSession> = new Map();

export const startCollaborationSession = (formId: string): CollaborationSession => {
  const existing = collaborationSessions.get(formId);
  if (existing) return existing;
  
  const session: CollaborationSession = {
    id: 'session_' + Math.random().toString(36).substr(2, 9),
    formId,
    users: [],
    changes: [],
    createdAt: Date.now()
  };
  collaborationSessions.set(formId, session);
  return session;
};

export const addUserToCollaboration = (formId: string, userId: string, userName: string): void => {
  const session = collaborationSessions.get(formId) || startCollaborationSession(formId);
  const existing = session.users.find(u => u.userId === userId);
  if (!existing) {
    session.users.push({ userId, userName, isActive: true, lastSeen: Date.now() });
  } else {
    existing.isActive = true;
    existing.lastSeen = Date.now();
  }
};

export const removeUserFromCollaboration = (formId: string, userId: string): void => {
  const session = collaborationSessions.get(formId);
  if (session) {
    const user = session.users.find(u => u.userId === userId);
    if (user) user.isActive = false;
  }
};

export const logChange = (formId: string, userId: string, fieldId: string, action: string, before: any, after: any): ChangeLog => {
  const session = collaborationSessions.get(formId) || startCollaborationSession(formId);
  const change: ChangeLog = {
    id: 'change_' + Math.random().toString(36).substr(2, 9),
    userId,
    fieldId,
    action: action as any,
    before,
    after,
    timestamp: Date.now()
  };
  session.changes.push(change);
  return change;
};

export const getCollaborationSession = (formId: string): CollaborationSession | null => {
  return collaborationSessions.get(formId) || null;
};

export const getActiveCollaborators = (formId: string): { userId: string; userName: string }[] => {
  const session = collaborationSessions.get(formId);
  if (!session) return [];
  return session.users.filter(u => u.isActive).map(u => ({ userId: u.userId, userName: u.userName }));
};

export default {
  createWebhook,
  getWebhooks,
  triggerWebhook,
  integrateWithZapier,
  integrateWithMake,
  createFormVersion,
  getFormVersions,
  restoreFormVersion,
  startCollaborationSession,
  addUserToCollaboration,
  getActiveCollaborators,
  logChange
};
