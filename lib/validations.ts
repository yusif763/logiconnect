import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyEmail: z.string().email('Invalid company email'),
  companyPhone: z.string().min(7, 'Invalid phone number'),
  companyAddress: z.string().min(5, 'Address too short'),
})

export const announcementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  cargoType: z.string().min(2, 'Cargo type is required'),
  weight: z.coerce.number().positive('Weight must be positive'),
  volume: z.coerce.number().positive('Volume must be positive').optional().nullable(),
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
  deadline: z.string().min(1, 'Deadline is required'),
})

export const offerItemSchema = z.object({
  transportType: z.enum(['AIR', 'SEA', 'RAIL', 'ROAD']),
  price: z.coerce.number().positive('Price must be positive'),
  currency: z.enum(['USD', 'EUR', 'AZN']),
  deliveryDays: z.coerce.number().int().positive('Delivery days must be positive'),
  notes: z.string().optional(),
})

export const offerSchema = z.object({
  announcementId: z.string(),
  notes: z.string().optional(),
  items: z.array(offerItemSchema).min(1, 'At least one transport type is required'),
})

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AnnouncementInput = z.infer<typeof announcementSchema>
export type OfferInput = z.infer<typeof offerSchema>
export type OfferItemInput = z.infer<typeof offerItemSchema>
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
