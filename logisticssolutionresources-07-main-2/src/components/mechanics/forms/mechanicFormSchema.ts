
import { z } from 'zod';

export const mechanicFormSchema = z.object({
  profile_id: z.string().min(1, 'Profile ID is required'),
  mechanic_license_number: z.string().optional(),
  certification_level: z.string().optional(),
  hourly_rate: z.number().min(0).optional(),
  specializations: z.string().optional(),
  is_available: z.boolean().default(true),
});

export type MechanicFormData = z.infer<typeof mechanicFormSchema>;
