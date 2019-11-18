import { webhookBody } from "./helpers/builders";
import { actitoDelete, actitoGet, actitoPost, actitoPut } from "./helpers/http";
import { objectToProperties, propertiesToObject } from "./helpers/translators";
import { IAPIProperty, IAPISearch, IAPISort, WebhookType } from "./types";

export async function addRecord(tableId: string, record: object) {
  return actitoPost(`customTable/${tableId}/record`, { properties: objectToProperties(record) });
}

export async function getRecord(tableId: string, recordId: string) {
  const { properties }: { properties: IAPIProperty[] } = await actitoGet(`customTable/${tableId}/record/${recordId}`);
  return propertiesToObject(properties);
}

export async function getRecords(tableId: string, search?: IAPISearch, sort?: IAPISort, limit?: number) {
  const query =
    (search !== undefined
      ? `searchField=${encodeURIComponent(search.searchField)}&searchValue=${encodeURIComponent(search.searchValue)}&`
      : "") +
    (sort !== undefined ? `sortedField=${encodeURIComponent(sort.sortedField)}&ascending=${sort.ascending}&` : "") +
    (limit !== undefined ? `number=${limit}&` : "");
  const elements: { records: [{ properties: IAPIProperty[] }] } = await actitoGet(
    `customTable/${tableId}/record?${query}`
  );
  return elements.records.map(record => propertiesToObject(record.properties));
}

export async function updateRecord(tableId: string, recordId: string, record: object) {
  return await actitoPut(`customTable/${tableId}/record/${recordId}`, { properties: objectToProperties(record) });
}

export async function increment(tableId: string, recordId: string, field: string, incrementValue: number) {
  const record = await getRecord(tableId, recordId);
  const previousValue: number = record[field] || 0;
  await updateRecord(tableId, recordId, { [field]: previousValue + incrementValue });
}

export async function deleteRecord(tableId: string, recordId: string) {
  return await actitoDelete(`customTable/${tableId}/record/${recordId}`);
}

export async function registerWebhook(
  table: string,
  type: WebhookType,
  targetUrl: string,
  isActive: boolean,
  onFields?: string[],
  headers?: { [key: string]: string }
) {
  return await actitoPost(
    `customTable/${table}/webhookSubscription`,
    webhookBody(targetUrl, type, isActive, onFields, headers)
  );
}
