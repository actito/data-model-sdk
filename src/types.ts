export interface IActitoCredentials {
  user: string;
  password: string;
  entity: string;
  env: "test" | "prod";
}

export interface IAPIProperty {
  name: string;
  value: string | boolean;
}

export interface IAPISearch {
  searchField: string;
  searchValue: string;
}

export interface IAPISort {
  sortedField: string;
  ascending: boolean;
}

// TODO: add translator for segmentation
export type ISegmentation =
  | {
    category: string;
    name: string;
  }
  | {
    belongs: true;
    segmentation: {
      category: "string";
      name: "string";
    };
  };

// TODO: add translator for subscription
export interface ISubscription {
  name: number;
  subscribe: boolean;
}

export interface IAPIProfileBody {
  attributes?: IAPIProperty[];
  subscriptions?: ISubscription[];
  segmentations?: ISegmentation[];
  dataCollectionInformation?: {
    date: string;
    source: string;
    way: string;
  };
}

// TODO: make dataCollectionInformation mandatory on create / update

export interface IProfileRecord {
  profile?: { [key: string]: string };
  subscriptions?: ISubscription[];
  segmentations?: ISegmentation[];
  dataCollectionInformation?: {
    date: string;
    source: string;
    way: string;
  };
}

export enum WebhookType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  UPDATED_SUBSCRIPTION = "UPDATED_SUBSCRIPTION",
  UPDATED_SEGMENT = "UPDATED_SEGMENT"
}

export interface IAPIWebhookBody {
  eventType: WebhookType,
  headers?: { [key: string]: string },
  isActive: boolean,
  onFields?: string[],
  targetUrl: string
}