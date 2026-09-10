import { z } from 'zod';

export const LoginPayloadSchema = z.object({
  pin: z.string().min(1, 'PIN or password is required').max(64),
});

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
