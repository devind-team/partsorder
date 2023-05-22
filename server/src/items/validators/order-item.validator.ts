import { z } from 'zod'

export const orderItemValidator = z.object({
  quantity: z.number().positive(),
  carNo: z.string().optional(),
  routeNo: z.string().optional(),
  deliveryType: z.string().optional(),
  orderId: z.number().positive(),
  productId: z.number().positive(),
  userId: z.number().optional(),
})
