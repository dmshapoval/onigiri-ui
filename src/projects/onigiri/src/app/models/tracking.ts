
export type TrackingContext = {
  [key: string]: string;
}

export const TRACKING = {
  INVOICE: {
    CREATE: 'Invoice: Created',
    PREVIEW_REQUEST: 'Invoice: Preview Requested',
    PDF_DOWNLOAD: 'Invoice: PDF Downloaded',
    EMAIL_REQUEST: 'Invoice: Send Email Requested',
    SHARE_LINK_REQUEST: 'Invoice: Share Link Requested',
    SHARE_LINK_COPY: 'Invoice: Shared Link Copied'
  },

  CUSTOMER: {
    CREATE: 'Client: Created'
  },

  SERVICE: {
    CREATE: 'Service: Created'
  },

  PROJECT: {
    CREATE: 'Project: Created',
    ARCHIVE: 'Project: Archived',
  },

  SUBSCRIPTION: {
    UPGRADE_REQUEST: 'Subscription: Upgrade Requested'
  }
};