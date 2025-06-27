import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export { pool as db };

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}

export async function createUser(email: string, passwordHash: string, name: string, authProvider: string = 'local'): Promise<User> {
  const query = `
    INSERT INTO users (email, password_hash, name, auth_provider)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, name, auth_provider, created_at, updated_at
  `;
  
  const result = await db.query(query, [email, passwordHash, name, authProvider]);
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const query = 'SELECT id, email, name, auth_provider, created_at, updated_at FROM users WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

export async function updateUserLastLogin(id: string): Promise<void> {
  const query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1';
  await db.query(query, [id]);
}

// Meal types and functions
export interface Meal {
  id: string;
  user_id: string;
  meal_date: string;
  photo_url: string | null;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealItem {
  id: string;
  meal_id: string;
  name: string;
  quantity: number;
  unit: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  created_at: string;
  updated_at: string;
}

export interface MealWithItems extends Meal {
  items: MealItem[];
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_calories: number;
  item_count: number;
}

export async function createMeal(
  userId: string, 
  mealDate: string, 
  photoUrl: string | null, 
  source: string,
  notes: string | null
): Promise<Meal> {
  const query = `
    INSERT INTO meals (user_id, meal_date, photo_url, source, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await db.query(query, [userId, mealDate, photoUrl, source, notes]);
  return result.rows[0];
}

export async function findMealsByUserId(
  userId: string,
  options: {
    date?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<MealWithItems[]> {
  let query = `
    SELECT 
      m.*,
      COALESCE(SUM(mi.protein), 0) as total_protein,
      COALESCE(SUM(mi.carbs), 0) as total_carbs,
      COALESCE(SUM(mi.fat), 0) as total_fat,
      COALESCE(SUM(mi.calories), 0) as total_calories,
      COUNT(mi.id) as item_count
    FROM meals m
    LEFT JOIN meal_items mi ON m.id = mi.meal_id
    WHERE m.user_id = $1
  `;
  
  const params: any[] = [userId];
  let paramIndex = 2;

  // Add date filters
  if (options.date) {
    query += ` AND m.meal_date = $${paramIndex}`;
    params.push(options.date);
    paramIndex++;
  } else if (options.startDate && options.endDate) {
    query += ` AND m.meal_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
    params.push(options.startDate, options.endDate);
    paramIndex += 2;
  } else if (options.startDate) {
    query += ` AND m.meal_date >= $${paramIndex}`;
    params.push(options.startDate);
    paramIndex++;
  } else if (options.endDate) {
    query += ` AND m.meal_date <= $${paramIndex}`;
    params.push(options.endDate);
    paramIndex++;
  }

  query += ` GROUP BY m.id ORDER BY m.meal_date DESC, m.created_at DESC`;

  // Add pagination
  if (options.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(options.limit);
    paramIndex++;
  }
  if (options.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(options.offset);
  }

  const result = await db.query(query, params);
  return result.rows.map(row => ({
    ...row,
    total_protein: parseFloat(row.total_protein) || 0,
    total_carbs: parseFloat(row.total_carbs) || 0,
    total_fat: parseFloat(row.total_fat) || 0,
    total_calories: parseFloat(row.total_calories) || 0,
    item_count: parseInt(row.item_count) || 0,
    items: [] // Will be populated separately if needed
  }));
}

export async function findMealById(mealId: string, userId: string): Promise<MealWithItems | null> {
  const mealQuery = `
    SELECT 
      m.*,
      COALESCE(SUM(mi.protein), 0) as total_protein,
      COALESCE(SUM(mi.carbs), 0) as total_carbs,
      COALESCE(SUM(mi.fat), 0) as total_fat,
      COALESCE(SUM(mi.calories), 0) as total_calories,
      COUNT(mi.id) as item_count
    FROM meals m
    LEFT JOIN meal_items mi ON m.id = mi.meal_id
    WHERE m.id = $1 AND m.user_id = $2
    GROUP BY m.id
  `;
  
  const itemsQuery = `
    SELECT * FROM meal_items 
    WHERE meal_id = $1 
    ORDER BY created_at ASC
  `;

  const [mealResult, itemsResult] = await Promise.all([
    db.query(mealQuery, [mealId, userId]),
    db.query(itemsQuery, [mealId])
  ]);

  if (mealResult.rows.length === 0) {
    return null;
  }

  const meal = mealResult.rows[0];
  const items = itemsResult.rows;

  return {
    ...meal,
    total_protein: parseFloat(meal.total_protein) || 0,
    total_carbs: parseFloat(meal.total_carbs) || 0,
    total_fat: parseFloat(meal.total_fat) || 0,
    total_calories: parseFloat(meal.total_calories) || 0,
    item_count: parseInt(meal.item_count) || 0,
    items
  };
}

export async function updateMeal(
  mealId: string,
  userId: string,
  updates: {
    meal_date?: string;
    notes?: string | null;
  }
): Promise<Meal | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.meal_date !== undefined) {
    fields.push(`meal_date = $${paramIndex}`);
    values.push(updates.meal_date);
    paramIndex++;
  }

  if (updates.notes !== undefined) {
    fields.push(`notes = $${paramIndex}`);
    values.push(updates.notes);
    paramIndex++;
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(mealId, userId);

  const query = `
    UPDATE meals 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0] || null;
}

export async function deleteMeal(mealId: string, userId: string): Promise<boolean> {
  const query = 'DELETE FROM meals WHERE id = $1 AND user_id = $2';
  const result = await db.query(query, [mealId, userId]);
  return result.rowCount > 0;
}

export async function createMealItem(
  mealId: string,
  name: string,
  quantity: number,
  unit: string,
  protein: number = 0,
  carbs: number = 0,
  fat: number = 0,
  calories: number = 0
): Promise<MealItem> {
  const query = `
    INSERT INTO meal_items (meal_id, name, quantity, unit, protein, carbs, fat, calories)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const result = await db.query(query, [mealId, name, quantity, unit, protein, carbs, fat, calories]);
  return result.rows[0];
}

export async function findMealItemById(itemId: string, mealId: string): Promise<MealItem | null> {
  const query = `
    SELECT mi.* 
    FROM meal_items mi
    JOIN meals m ON mi.meal_id = m.id
    WHERE mi.id = $1 AND mi.meal_id = $2
  `;
  
  const result = await db.query(query, [itemId, mealId]);
  return result.rows[0] || null;
}

export async function findMealItemWithOwnership(itemId: string, mealId: string, userId: string): Promise<MealItem | null> {
  const query = `
    SELECT mi.* 
    FROM meal_items mi
    JOIN meals m ON mi.meal_id = m.id
    WHERE mi.id = $1 AND mi.meal_id = $2 AND m.user_id = $3
  `;
  
  const result = await db.query(query, [itemId, mealId, userId]);
  return result.rows[0] || null;
}

export async function updateMealItem(
  itemId: string,
  mealId: string,
  userId: string,
  updates: {
    name?: string;
    quantity?: number;
    unit?: string;
    protein?: number;
    carbs?: number;
    fat?: number;
    calories?: number;
  }
): Promise<MealItem | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Build dynamic update query
  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex}`);
    values.push(updates.name);
    paramIndex++;
  }

  if (updates.quantity !== undefined) {
    fields.push(`quantity = $${paramIndex}`);
    values.push(updates.quantity);
    paramIndex++;
  }

  if (updates.unit !== undefined) {
    fields.push(`unit = $${paramIndex}`);
    values.push(updates.unit);
    paramIndex++;
  }

  if (updates.protein !== undefined) {
    fields.push(`protein = $${paramIndex}`);
    values.push(updates.protein);
    paramIndex++;
  }

  if (updates.carbs !== undefined) {
    fields.push(`carbs = $${paramIndex}`);
    values.push(updates.carbs);
    paramIndex++;
  }

  if (updates.fat !== undefined) {
    fields.push(`fat = $${paramIndex}`);
    values.push(updates.fat);
    paramIndex++;
  }

  if (updates.calories !== undefined) {
    fields.push(`calories = $${paramIndex}`);
    values.push(updates.calories);
    paramIndex++;
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(itemId, mealId, userId);

  const query = `
    UPDATE meal_items 
    SET ${fields.join(', ')}
    FROM meals
    WHERE meal_items.id = $${paramIndex} 
      AND meal_items.meal_id = $${paramIndex + 1}
      AND meals.id = meal_items.meal_id
      AND meals.user_id = $${paramIndex + 2}
    RETURNING meal_items.*
  `;

  const result = await db.query(query, values);
  return result.rows[0] || null;
}

export async function deleteMealItem(itemId: string, mealId: string, userId: string): Promise<boolean> {
  const query = `
    DELETE FROM meal_items 
    USING meals
    WHERE meal_items.id = $1 
      AND meal_items.meal_id = $2
      AND meals.id = meal_items.meal_id
      AND meals.user_id = $3
  `;
  
  const result = await db.query(query, [itemId, mealId, userId]);
  return result.rowCount > 0;
}

// Goal types and functions
export interface Goal {
  id: string;
  user_id: string;
  target_protein: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function findActiveGoal(userId: string): Promise<Goal | null> {
  const query = `
    SELECT * FROM daily_goals 
    WHERE user_id = $1 
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    ORDER BY start_date DESC
    LIMIT 1
  `;
  
  const result = await db.query(query, [userId]);
  return result.rows[0] || null;
}

export async function createGoal(
  userId: string,
  targetProtein: number,
  startDate: string,
  endDate: string | null = null
): Promise<Goal> {
  // Start a transaction to ensure consistency
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Close any existing active goals by setting end_date to one day before the new start_date
    const closeQuery = `
      UPDATE daily_goals 
      SET end_date = $1::date - INTERVAL '1 day', updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 
        AND (end_date IS NULL OR end_date >= $1::date)
        AND start_date < $1::date
    `;
    await client.query(closeQuery, [startDate, userId]);
    
    // Create the new goal
    const createQuery = `
      INSERT INTO daily_goals (user_id, target_protein, start_date, end_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await client.query(createQuery, [userId, targetProtein, startDate, endDate]);
    
    await client.query('COMMIT');
    return result.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateGoal(
  goalId: string,
  userId: string,
  updates: {
    target_protein?: number;
    end_date?: string | null;
  }
): Promise<Goal | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.target_protein !== undefined) {
    fields.push(`target_protein = $${paramIndex}`);
    values.push(updates.target_protein);
    paramIndex++;
  }

  if (updates.end_date !== undefined) {
    fields.push(`end_date = $${paramIndex}`);
    values.push(updates.end_date);
    paramIndex++;
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(goalId, userId);

  const query = `
    UPDATE daily_goals 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0] || null;
}

export async function findGoalHistory(
  userId: string,
  options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Goal[]> {
  let query = `
    SELECT * FROM daily_goals 
    WHERE user_id = $1
  `;
  
  const params: any[] = [userId];
  let paramIndex = 2;

  // Add date filters
  if (options.startDate) {
    query += ` AND start_date >= $${paramIndex}`;
    params.push(options.startDate);
    paramIndex++;
  }
  
  if (options.endDate) {
    query += ` AND start_date <= $${paramIndex}`;
    params.push(options.endDate);
    paramIndex++;
  }

  query += ` ORDER BY start_date DESC`;

  // Add pagination
  if (options.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(options.limit);
    paramIndex++;
  }
  
  if (options.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(options.offset);
  }

  const result = await db.query(query, params);
  return result.rows;
}

export async function findGoalById(goalId: string, userId: string): Promise<Goal | null> {
  const query = `
    SELECT * FROM daily_goals 
    WHERE id = $1 AND user_id = $2
  `;
  
  const result = await db.query(query, [goalId, userId]);
  return result.rows[0] || null;
}

// Habit types and functions
export interface Habit {
  id: string;
  user_id: string;
  title: string;
  target_frequency: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
}

export interface HabitWithStats extends Habit {
  total_logs: number;
  completed_logs: number;
  completion_rate: number;
  last_logged: string | null;
}

export async function findHabitsByUserId(
  userId: string,
  options: {
    archived?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<HabitWithStats[]> {
  let query = `
    SELECT 
      h.*,
      COUNT(hl.id) as total_logs,
      COUNT(CASE WHEN hl.completed = true THEN 1 END) as completed_logs,
      CASE 
        WHEN COUNT(hl.id) > 0 
        THEN ROUND((COUNT(CASE WHEN hl.completed = true THEN 1 END)::DECIMAL / COUNT(hl.id)) * 100, 2)
        ELSE 0 
      END as completion_rate,
      MAX(hl.log_date) as last_logged
    FROM habits h
    LEFT JOIN habit_logs hl ON h.id = hl.habit_id
    WHERE h.user_id = $1
  `;
  
  const params: any[] = [userId];
  let paramIndex = 2;

  // Filter by archived status
  if (options.archived !== undefined) {
    query += ` AND h.archived = $${paramIndex}`;
    params.push(options.archived);
    paramIndex++;
  }

  query += ` GROUP BY h.id ORDER BY h.created_at DESC`;

  // Add pagination
  if (options.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(options.limit);
    paramIndex++;
  }
  
  if (options.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(options.offset);
  }

  const result = await db.query(query, params);
  return result.rows.map(row => ({
    ...row,
    target_frequency: parseInt(row.target_frequency),
    total_logs: parseInt(row.total_logs) || 0,
    completed_logs: parseInt(row.completed_logs) || 0,
    completion_rate: parseFloat(row.completion_rate) || 0
  }));
}

export async function createHabit(
  userId: string,
  title: string,
  targetFrequency: number
): Promise<Habit> {
  const query = `
    INSERT INTO habits (user_id, title, target_frequency)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  
  const result = await db.query(query, [userId, title, targetFrequency]);
  return {
    ...result.rows[0],
    target_frequency: parseInt(result.rows[0].target_frequency)
  };
}

export async function findHabitById(habitId: string, userId: string): Promise<Habit | null> {
  const query = `
    SELECT * FROM habits 
    WHERE id = $1 AND user_id = $2
  `;
  
  const result = await db.query(query, [habitId, userId]);
  if (result.rows.length === 0) return null;
  
  return {
    ...result.rows[0],
    target_frequency: parseInt(result.rows[0].target_frequency)
  };
}

export async function updateHabit(
  habitId: string,
  userId: string,
  updates: {
    title?: string;
    archived?: boolean;
  }
): Promise<Habit | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex}`);
    values.push(updates.title);
    paramIndex++;
  }

  if (updates.archived !== undefined) {
    fields.push(`archived = $${paramIndex}`);
    values.push(updates.archived);
    paramIndex++;
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(habitId, userId);

  const query = `
    UPDATE habits 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    RETURNING *
  `;

  const result = await db.query(query, values);
  if (result.rows.length === 0) return null;
  
  return {
    ...result.rows[0],
    target_frequency: parseInt(result.rows[0].target_frequency)
  };
}

export async function deleteHabit(habitId: string, userId: string): Promise<boolean> {
  const query = 'DELETE FROM habits WHERE id = $1 AND user_id = $2';
  const result = await db.query(query, [habitId, userId]);
  return result.rowCount > 0;
}

// Habit log functions
export async function createHabitLog(
  habitId: string,
  logDate: string,
  completed: boolean,
  userId: string
): Promise<HabitLog> {
  // First verify the habit belongs to the user
  const habitCheck = await findHabitById(habitId, userId);
  if (!habitCheck) {
    throw new Error('Habit not found');
  }

  const query = `
    INSERT INTO habit_logs (habit_id, log_date, completed)
    VALUES ($1, $2, $3)
    ON CONFLICT (habit_id, log_date) 
    DO UPDATE SET completed = EXCLUDED.completed, created_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  
  const result = await db.query(query, [habitId, logDate, completed]);
  return result.rows[0];
}

export async function findHabitLogs(
  habitId: string,
  userId: string,
  options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<HabitLog[]> {
  // First verify the habit belongs to the user
  const habitCheck = await findHabitById(habitId, userId);
  if (!habitCheck) {
    throw new Error('Habit not found');
  }

  let query = `
    SELECT * FROM habit_logs 
    WHERE habit_id = $1
  `;
  
  const params: any[] = [habitId];
  let paramIndex = 2;

  // Add date filters
  if (options.startDate) {
    query += ` AND log_date >= $${paramIndex}`;
    params.push(options.startDate);
    paramIndex++;
  }
  
  if (options.endDate) {
    query += ` AND log_date <= $${paramIndex}`;
    params.push(options.endDate);
    paramIndex++;
  }

  query += ` ORDER BY log_date DESC`;

  // Add pagination
  if (options.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(options.limit);
    paramIndex++;
  }
  
  if (options.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(options.offset);
  }

  const result = await db.query(query, params);
  return result.rows;
}

export async function findHabitLogById(logId: string, habitId: string, userId: string): Promise<HabitLog | null> {
  // Verify ownership through habit
  const query = `
    SELECT hl.* 
    FROM habit_logs hl
    JOIN habits h ON hl.habit_id = h.id
    WHERE hl.id = $1 AND hl.habit_id = $2 AND h.user_id = $3
  `;
  
  const result = await db.query(query, [logId, habitId, userId]);
  return result.rows[0] || null;
}

export async function deleteHabitLog(logId: string, habitId: string, userId: string): Promise<boolean> {
  const query = `
    DELETE FROM habit_logs 
    USING habits
    WHERE habit_logs.id = $1 
      AND habit_logs.habit_id = $2
      AND habits.id = habit_logs.habit_id
      AND habits.user_id = $3
  `;
  
  const result = await db.query(query, [logId, habitId, userId]);
  return result.rowCount > 0;
}

// Progress types and functions
export interface PhysicalProgress {
  id: string;
  user_id: string;
  logged_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  height_cm: number | null;
  bmi: number | null;
  created_at: string;
}

export interface ProgressWithChanges extends PhysicalProgress {
  weight_change?: number | null;
  body_fat_change?: number | null;
  bmi_change?: number | null;
  days_since_last?: number | null;
}

// BMI calculation utility
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 100) / 100; // Round to 2 decimal places
}

export async function createProgressEntry(
  userId: string,
  data: {
    weight_kg?: number;
    body_fat_pct?: number;
    height_cm?: number;
  }
): Promise<PhysicalProgress> {
  let bmi: number | null = null;
  
  // Calculate BMI if both weight and height are provided
  if (data.weight_kg && data.height_cm) {
    bmi = calculateBMI(data.weight_kg, data.height_cm);
  } else if (data.weight_kg && !data.height_cm) {
    // If only weight is provided, try to get the most recent height
    const lastHeightQuery = `
      SELECT height_cm FROM physical_progress 
      WHERE user_id = $1 AND height_cm IS NOT NULL 
      ORDER BY logged_at DESC 
      LIMIT 1
    `;
    const heightResult = await db.query(lastHeightQuery, [userId]);
    if (heightResult.rows.length > 0 && heightResult.rows[0].height_cm) {
      bmi = calculateBMI(data.weight_kg, heightResult.rows[0].height_cm);
    }
  }
  
  const query = `
    INSERT INTO physical_progress (user_id, logged_at, weight_kg, body_fat_pct, height_cm, bmi)
    VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await db.query(query, [
    userId,
    data.weight_kg || null,
    data.body_fat_pct || null,
    data.height_cm || null,
    bmi
  ]);
  
  return result.rows[0];
}

export async function findProgressByUserId(
  userId: string,
  options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<ProgressWithChanges[]> {
  let query = `
    WITH progress_with_previous AS (
      SELECT 
        pp.*,
        LAG(pp.weight_kg) OVER (ORDER BY pp.logged_at) as prev_weight,
        LAG(pp.body_fat_pct) OVER (ORDER BY pp.logged_at) as prev_body_fat,
        LAG(pp.bmi) OVER (ORDER BY pp.logged_at) as prev_bmi,
        LAG(pp.logged_at) OVER (ORDER BY pp.logged_at) as prev_logged_at
      FROM physical_progress pp
      WHERE pp.user_id = $1
  `;
  
  const params: any[] = [userId];
  let paramIndex = 2;

  // Add date filters
  if (options.startDate) {
    query += ` AND pp.logged_at >= $${paramIndex}::date`;
    params.push(options.startDate);
    paramIndex++;
  }
  
  if (options.endDate) {
    query += ` AND pp.logged_at <= $${paramIndex}::date + INTERVAL '1 day'`;
    params.push(options.endDate);
    paramIndex++;
  }

  query += `
    )
    SELECT 
      *,
      CASE 
        WHEN weight_kg IS NOT NULL AND prev_weight IS NOT NULL 
        THEN ROUND((weight_kg - prev_weight)::DECIMAL, 2)
        ELSE NULL 
      END as weight_change,
      CASE 
        WHEN body_fat_pct IS NOT NULL AND prev_body_fat IS NOT NULL 
        THEN ROUND((body_fat_pct - prev_body_fat)::DECIMAL, 2)
        ELSE NULL 
      END as body_fat_change,
      CASE 
        WHEN bmi IS NOT NULL AND prev_bmi IS NOT NULL 
        THEN ROUND((bmi - prev_bmi)::DECIMAL, 2)
        ELSE NULL 
      END as bmi_change,
      CASE 
        WHEN prev_logged_at IS NOT NULL 
        THEN EXTRACT(DAY FROM logged_at - prev_logged_at)::INTEGER
        ELSE NULL 
      END as days_since_last
    FROM progress_with_previous
    ORDER BY logged_at DESC
  `;

  // Add pagination
  if (options.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(options.limit);
    paramIndex++;
  }
  
  if (options.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(options.offset);
  }

  const result = await db.query(query, params);
  return result.rows.map(row => ({
    ...row,
    weight_kg: row.weight_kg ? parseFloat(row.weight_kg) : null,
    body_fat_pct: row.body_fat_pct ? parseFloat(row.body_fat_pct) : null,
    height_cm: row.height_cm ? parseFloat(row.height_cm) : null,
    bmi: row.bmi ? parseFloat(row.bmi) : null,
    weight_change: row.weight_change ? parseFloat(row.weight_change) : null,
    body_fat_change: row.body_fat_change ? parseFloat(row.body_fat_change) : null,
    bmi_change: row.bmi_change ? parseFloat(row.bmi_change) : null,
    days_since_last: row.days_since_last ? parseInt(row.days_since_last) : null
  }));
}

// User profile management types and functions
export interface UserProfile extends User {
  height_cm?: number | null;
  last_height_logged?: string | null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const query = `
    SELECT 
      u.id, u.email, u.name, u.auth_provider, u.created_at, u.updated_at,
      pp.height_cm, pp.logged_at as last_height_logged
    FROM users u
    LEFT JOIN (
      SELECT DISTINCT ON (user_id) user_id, height_cm, logged_at
      FROM physical_progress 
      WHERE height_cm IS NOT NULL
      ORDER BY user_id, logged_at DESC
    ) pp ON u.id = pp.user_id
    WHERE u.id = $1
  `;
  
  const result = await db.query(query, [userId]);
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    ...row,
    height_cm: row.height_cm ? parseFloat(row.height_cm) : null
  };
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    email?: string;
  }
): Promise<User | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex}`);
    values.push(updates.name);
    paramIndex++;
  }

  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex}`);
    values.push(updates.email.toLowerCase());
    paramIndex++;
  }

  if (fields.length === 0) {
    return null;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, email, name, auth_provider, created_at, updated_at
  `;

  try {
    const result = await db.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    // Handle unique constraint violation for email
    if (error instanceof Error && error.message.includes('duplicate key')) {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  // Using a transaction to ensure data consistency
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if user exists
    const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }
    
    // Delete user (CASCADE will handle related data)
    const deleteResult = await client.query('DELETE FROM users WHERE id = $1', [userId]);
    
    await client.query('COMMIT');
    return deleteResult.rowCount > 0;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function verifyUserOwnership(userId: string, requestUserId: string): Promise<boolean> {
  return userId === requestUserId;
}

export async function getUserForPasswordVerification(userId: string): Promise<Pick<User, 'id' | 'password_hash' | 'auth_provider'> | null> {
  const query = 'SELECT id, password_hash, auth_provider FROM users WHERE id = $1';
  const result = await db.query(query, [userId]);
  return result.rows[0] || null;
}