import { IAPIWebhookBody, WebhookType } from "../types";

export function webhookBody(targetUrl: string, type: WebhookType, isActive: boolean, onFields?: string[], headers?: { [key: string]: string }): IAPIWebhookBody {
    return {
        eventType: type,
        headers: headers,
        isActive: isActive,
        onFields: onFields,
        targetUrl: targetUrl
    };
}
