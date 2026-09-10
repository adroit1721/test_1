import { z } from 'zod';

export const SettingPayloadSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
});

export const BulkSettingsPayloadSchema = z.object({
  settings: z.record(z.string(), z.any()),
});

export type SettingPayload = z.infer<typeof SettingPayloadSchema>;
export type BulkSettingsPayload = z.infer<typeof BulkSettingsPayloadSchema>;
