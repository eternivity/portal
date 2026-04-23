export type SubscriptionPlan = "starter" | "pro" | "agency";

export type ProjectStatus = "active" | "review" | "completed";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  plan: SubscriptionPlan;
  avatarUrl?: string;
}

export interface Client {
  id: string;
  freelancerId: string;
  name: string;
  email: string;
  company?: string;
  portalSlug: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate: string;
  progress: number;
}

export interface PortalFile {
  id: string;
  projectId: string;
  name: string;
  size: string;
  url: string;
  uploadedAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  body: string;
  createdAt: string;
  isClient: boolean;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  number: string;
  status: InvoiceStatus;
  currency: string;
  lineItems: InvoiceLineItem[];
  dueDate: string;
  createdAt: string;
}
