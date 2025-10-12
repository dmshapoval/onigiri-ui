export interface ProjectInfo {
  id: string;
  name: string | null;
  description: string | null;
  customerId: string | null;
  isSample: boolean;
  isCompleted: boolean;
  createdAt: Date;
  completedAt: Date | null;
}

export interface Project {
  id: string;
  name: string | null;
  description: string | null;
  customerId: string | null
  isSample: boolean;
  isCompleted: boolean;
  createdAt: Date;
  completedAt: Date | null;
  links: ProjectLink[];
  tasks: ProjectTask[];
}

export interface ProjectData {
  name: string | null;
  customer: string | null;
  description: string | null;
}

export interface ProjectTask {
  isCompleted: boolean;
  text: string
}

export const SAMPLE_PROJECT_CUSTOMER_NAME = 'Chrisitian Millenwolfenken';

export type ProjectLink = CustomUrlProjectLink | InvoiceProjectLink;
export type ProjectLinkType = ProjectLink['type'];

export interface CustomUrlProjectLink {
  id: string;
  type: 'url';
  url: string;
  title: string | null;
  icon: string | null;
  description: string | null;
  createdAt: Date;
}

export interface InvoiceProjectLink {
  id: string;
  type: 'invoice';
  invoiceId: string;
  createdAt: Date;
}

// export interface Project {
//   id: string;
//   name: string | null;
//   description: string | null;
//   customer: string | null,
//   isSample: boolean;
//   isArchived: boolean;
//   tasks: ProjectTask[];
// }

export interface CustomUrlProjectLinkData {
  url: string;
  title: string | null;
  icon: string | null;
  description: string | null;
}