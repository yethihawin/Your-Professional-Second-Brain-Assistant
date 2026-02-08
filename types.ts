
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Attachment {
  name: string;
  type: string;
  data: string; // base64
}

export interface Artifact {
  id: string;
  type: 'summary' | 'guide' | 'quiz' | 'analysis';
  title: string;
  content: string;
  language: 'en' | 'my';
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  artifactId?: string;
}

export interface ActionLog {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
}

export enum TabType {
  KNOWLEDGE = 'KNOWLEDGE',
  STUDY = 'STUDY',
  VAULT = 'VAULT',
  INSIGHTS = 'INSIGHTS'
}
