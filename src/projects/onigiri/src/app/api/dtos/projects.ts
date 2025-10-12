import { Project, ProjectData, ProjectInfo, ProjectLink, ProjectTask } from "@onigiri-models";
import { toLocalDate } from "./date-time";
import { UnexpectedValueError, exhaustiveCheck } from "@oni-shared";

export interface ProjectCreateResultDto {
  id: string;
}

export interface ProjectDto {
  id: string;
  name: string | null;
  description: string | null;
  is_sample: boolean;
  is_completed: boolean;
  customer_id: string | null;
  tasks: ProjectTaskDto[];
  links: ProjectLinkDto[];
  created_at: number;
  completed_at: number | null;
}


export interface ProjectInfoDto {
  id: string;
  name: string | null;
  description: string | null;
  is_sample: boolean;
  is_completed: boolean;
  customer_id: string | null;
  created_at: number;
  completed_at: number | null;
}


export interface ProjectDataDto {
  name: string | null;
  description: string | null;
  customer: string | null;
}

export interface ProjectTaskDto {
  text: string;
  is_completed: boolean;
}

interface InvoiceProjectLinkDto {
  id: string;
  type: 'invoice',
  created_at: number;
  data: {
    invoice_id: string;
    // title: string | null;
    // date: string | null;
    // due_date: string | null;
    // created_at: number;
  }
}

interface CustomUrlProjectLinkDto {
  id: string;
  type: 'url',
  created_at: number;
  data: {
    url: string;
    title: string | null;
    icon: string | null;
    description: string | null;
  }
}

export interface CustomUrlProjectLinkDataDto {
  url: string;
  title: string | null;
  icon: string | null;
  description: string | null;
}

export type ProjectLinkDto = InvoiceProjectLinkDto | CustomUrlProjectLinkDto;

export function toProjectDataDto(data: ProjectData): ProjectDataDto {
  return {
    name: data.name,
    description: data.description,
    customer: data.customer
  };
}

export function toProjectInfo(data: ProjectInfoDto): ProjectInfo {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isSample: data.is_sample,
    isCompleted: data.is_completed,
    createdAt: new Date(data.created_at),
    completedAt: data.completed_at ? new Date(data.completed_at) : null,
    customerId: data.customer_id
  }
}

export function toProject(data: ProjectDto): Project {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isSample: data.is_sample,
    isCompleted: data.is_completed,
    createdAt: new Date(data.created_at),
    completedAt: data.completed_at ? new Date(data.completed_at) : null,
    customerId: data.customer_id,
    tasks: data.tasks.map(toProjectTask),
    links: data.links.map(toProjectLink)
  }
}


export function toProjectTaskDto(data: ProjectTask): ProjectTaskDto {
  return {
    text: data.text,
    is_completed: data.isCompleted
  }
}

export function toProjectTask(data: ProjectTaskDto): ProjectTask {
  return {
    text: data.text,
    isCompleted: data.is_completed
  }
}

export function toProjectLink(data: ProjectLinkDto): ProjectLink {
  switch (data.type) {
    case 'invoice': {
      return {
        id: data.id,
        type: 'invoice',
        invoiceId: data.data.invoice_id,
        // title: data.data.title,
        // date: data.data.date ? toLocalDate(data.data.date) : null,
        // dueDate: data.data.due_date ? toLocalDate(data.data.due_date) : null,
        createdAt: new Date(data.created_at)
      };
    }
    case 'url': {
      return {
        id: data.id,
        type: 'url',
        url: data.data.url,
        title: data.data.title,
        description: data.data.description,
        icon: data.data.icon,
        createdAt: new Date(data.created_at)
      };
    }

    default: {
      exhaustiveCheck(data);
      throw new UnexpectedValueError(data);
    }
  }
}

// export function toProject(data: ProjectDto): Project {
//   return {
//     id: data.id,
//     name: data.name,
//     description: data.description,
//     isArchived: data.is_archived,
//     isSample: data.is_sample,
//     customer: data.customer,
//     tasks: data.tasks.map(toProjectTask)
//   }
// }