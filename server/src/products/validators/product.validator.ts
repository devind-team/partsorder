import { z } from 'zod'

export const productValidator = z.object({
  vendorCode: z.string().min(1),
  name: z.string().optional(),
  manufacturer: z.string().optional(),
})
