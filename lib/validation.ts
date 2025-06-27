import { z } from 'zod';

// Authentication validation schemas
export const signupSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name too long')
    .trim(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'apple', 'facebook'], {
    errorMap: () => ({ message: 'Invalid auth provider' })
  }),
  token: z
    .string()
    .min(1, 'Provider token is required'),
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
  name: z
    .string()
    .max(255, 'Name too long')
    .optional(),
});

// Type exports for TypeScript
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => err.message).join(', ');
      throw new Error(`Validation failed: ${messages}`);
    }
    throw error;
  }
}

// Meal validation schemas
export const createMealSchema = z.object({
  meal_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid date'),
  photo_url: z
    .string()
    .url('Invalid photo URL')
    .optional()
    .nullable(),
  source: z
    .enum(['manual', 'ai', 'scan', 'search'], {
      errorMap: () => ({ message: 'Invalid source type' })
    })
    .default('manual'),
  notes: z
    .string()
    .max(1000, 'Notes too long')
    .optional()
    .nullable(),
});

export const updateMealSchema = z.object({
  meal_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid date')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes too long')
    .optional()
    .nullable(),
});

export const mealItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(255, 'Item name too long')
    .trim(),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .max(99999, 'Quantity too large'),
  unit: z
    .string()
    .min(1, 'Unit is required')
    .max(50, 'Unit too long')
    .trim(),
  protein: z
    .number()
    .min(0, 'Protein cannot be negative')
    .max(9999, 'Protein value too large')
    .default(0),
  carbs: z
    .number()
    .min(0, 'Carbs cannot be negative')
    .max(9999, 'Carbs value too large')
    .default(0),
  fat: z
    .number()
    .min(0, 'Fat cannot be negative')
    .max(9999, 'Fat value too large')
    .default(0),
  calories: z
    .number()
    .min(0, 'Calories cannot be negative')
    .max(99999, 'Calories value too large')
    .default(0),
});

export const mealQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .optional(),
  offset: z
    .string()
    .regex(/^\d+$/, 'Offset must be a number')
    .transform(Number)
    .refine(n => n >= 0, 'Offset cannot be negative')
    .optional(),
});

export const updateMealItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(255, 'Item name too long')
    .trim()
    .optional(),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .max(99999, 'Quantity too large')
    .optional(),
  unit: z
    .string()
    .min(1, 'Unit is required')
    .max(50, 'Unit too long')
    .trim()
    .optional(),
  protein: z
    .number()
    .min(0, 'Protein cannot be negative')
    .max(9999, 'Protein value too large')
    .optional(),
  carbs: z
    .number()
    .min(0, 'Carbs cannot be negative')
    .max(9999, 'Carbs value too large')
    .optional(),
  fat: z
    .number()
    .min(0, 'Fat cannot be negative')
    .max(9999, 'Fat value too large')
    .optional(),
  calories: z
    .number()
    .min(0, 'Calories cannot be negative')
    .max(99999, 'Calories value too large')
    .optional(),
});

// Goal validation schemas
export const createGoalSchema = z.object({
  target_protein: z
    .number()
    .min(5, 'Target protein must be at least 5 grams')
    .max(500, 'Target protein cannot exceed 500 grams')
    .multipleOf(0.01, 'Target protein must have at most 2 decimal places'),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid start date')
    .refine((date) => {
      const parsed = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsed <= today;
    }, 'Start date cannot be in the future'),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid end date')
    .optional()
    .nullable(),
}).refine((data) => {
  if (data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['end_date']
});

export const updateGoalSchema = z.object({
  target_protein: z
    .number()
    .min(5, 'Target protein must be at least 5 grams')
    .max(500, 'Target protein cannot exceed 500 grams')
    .multipleOf(0.01, 'Target protein must have at most 2 decimal places')
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid end date')
    .optional()
    .nullable(),
});

export const goalHistorySchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .optional(),
  offset: z
    .string()
    .regex(/^\d+$/, 'Offset must be a number')
    .transform(Number)
    .refine(n => n >= 0, 'Offset cannot be negative')
    .optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['end_date']
});

// Type exports for meals
export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;
export type MealItemInput = z.infer<typeof mealItemSchema>;
export type UpdateMealItemInput = z.infer<typeof updateMealItemSchema>;
export type MealQueryInput = z.infer<typeof mealQuerySchema>;

// Habit validation schemas
export const createHabitSchema = z.object({
  title: z
    .string()
    .min(1, 'Habit title is required')
    .max(255, 'Habit title too long')
    .trim(),
  target_frequency: z
    .number()
    .int('Target frequency must be a whole number')
    .min(1, 'Target frequency must be at least 1 day per week')
    .max(7, 'Target frequency cannot exceed 7 days per week'),
});

export const updateHabitSchema = z.object({
  title: z
    .string()
    .min(1, 'Habit title is required')
    .max(255, 'Habit title too long')
    .trim()
    .optional(),
  archived: z
    .boolean()
    .optional(),
});

export const createHabitLogSchema = z.object({
  log_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Log date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid log date')
    .refine((date) => {
      const parsed = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Allow logging for today
      return parsed <= today;
    }, 'Log date cannot be in the future'),
  completed: z
    .boolean()
    .default(false),
});

export const habitLogQuerySchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .optional(),
  offset: z
    .string()
    .regex(/^\d+$/, 'Offset must be a number')
    .transform(Number)
    .refine(n => n >= 0, 'Offset cannot be negative')
    .optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['end_date']
});

export const habitQuerySchema = z.object({
  archived: z
    .string()
    .transform((val) => val.toLowerCase())
    .refine((val) => ['true', 'false', 'all'].includes(val), 'Archived must be true, false, or all')
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .optional(),
  offset: z
    .string()
    .regex(/^\d+$/, 'Offset must be a number')
    .transform(Number)
    .refine(n => n >= 0, 'Offset cannot be negative')
    .optional(),
});

// Type exports for goals
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalHistoryInput = z.infer<typeof goalHistorySchema>;

// Type exports for habits
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CreateHabitLogInput = z.infer<typeof createHabitLogSchema>;
export type HabitLogQueryInput = z.infer<typeof habitLogQuerySchema>;
export type HabitQueryInput = z.infer<typeof habitQuerySchema>;

// Progress validation schemas
export const createProgressSchema = z.object({
  weight_kg: z
    .number()
    .positive('Weight must be positive')
    .max(999.99, 'Weight too large')
    .multipleOf(0.01, 'Weight must have at most 2 decimal places')
    .optional(),
  body_fat_pct: z
    .number()
    .min(0, 'Body fat percentage cannot be negative')
    .max(100, 'Body fat percentage cannot exceed 100')
    .multipleOf(0.01, 'Body fat percentage must have at most 2 decimal places')
    .optional(),
  height_cm: z
    .number()
    .positive('Height must be positive')
    .max(299.99, 'Height too large')
    .multipleOf(0.01, 'Height must have at most 2 decimal places')
    .optional(),
}).refine((data) => {
  // At least one measurement must be provided
  return data.weight_kg !== undefined || data.body_fat_pct !== undefined || data.height_cm !== undefined;
}, {
  message: 'At least one measurement (weight, body fat, or height) is required',
});

export const progressQuerySchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .optional(),
  offset: z
    .string()
    .regex(/^\d+$/, 'Offset must be a number')
    .transform(Number)
    .refine(n => n >= 0, 'Offset cannot be negative')
    .optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['end_date']
});

// Type exports for progress
export type CreateProgressInput = z.infer<typeof createProgressSchema>;
export type ProgressQueryInput = z.infer<typeof progressQuerySchema>;

// User profile validation schemas
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name too long')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email too long')
    .optional(),
  current_password: z
    .string()
    .min(1, 'Current password is required for email changes')
    .optional(),
}).refine((data) => {
  // If email is being updated, current_password is required
  if (data.email && !data.current_password) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required when updating email',
  path: ['current_password']
}).refine((data) => {
  // At least one field must be provided for update
  return data.name !== undefined || data.email !== undefined;
}, {
  message: 'At least one field (name or email) must be provided for update'
});

export const deleteUserSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required to delete account'),
  confirmation: z
    .string()
    .refine((val) => val === 'DELETE', 'Must type DELETE to confirm account deletion')
});

// UUID validation helper
export const uuidSchema = z
  .string()
  .uuid('Invalid user ID format');

// Type exports for user management
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;

// Common validation patterns
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;