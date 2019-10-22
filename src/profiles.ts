import { actitoDelete, actitoGet, actitoPost, actitoPut } from "./helpers/http";
import { apiProfileToProfile, profileToAPIProfile } from "./helpers/translators";
import { webhookBody } from "./helpers/builders";
import { IProfileRecord, WebhookType } from "./types";

export async function createProfile(table: string, profileSpec: IProfileRecord): Promise<{ profileId: string }> {
  return await actitoPost(`table/${table}/profile`, profileToAPIProfile(profileSpec));
}

export async function getProfile(table: string, profileId: string): Promise<IProfileRecord> {
  const apiProfile = await actitoGet(`table/${table}/profile/${profileId}`);
  return apiProfileToProfile(apiProfile);
}

export async function getProfiles(
  table: string,
  search: string,
  dateFilter?: string,
  limit?: number
): Promise<IProfileRecord[]> {
  const query =
    (search !== undefined ? `search=${encodeURIComponent(search)}&` : "") +
    (dateFilter !== undefined ? `dateFilter=${encodeURIComponent(dateFilter)}&` : "") +
    (limit !== undefined ? `number=${limit}&` : "");
  const apiProfiles = await actitoGet(`table/${table}/profile?${query}`);
  return apiProfiles.profiles.map(apiProfileToProfile);
}

export async function updateProfile(
  table: string,
  profileId: string,
  profileRecord: IProfileRecord
): Promise<{ profileId: string }> {
  return await actitoPut(`table/${table}/profile/${profileId}`, profileToAPIProfile(profileRecord));
}

export async function deleteProfile(table: string, profileId: string) {
  await actitoDelete(`table/${table}/profile/${profileId}`);
}

export async function registerWebhook(table: string, type: WebhookType, targetUrl: string, isActive: boolean, onFields?: string[], headers?: { [key: string]: string }) {
  return await actitoPost(`table/${table}/webhookSubscription`, webhookBody(targetUrl, type, isActive, onFields, headers));
}