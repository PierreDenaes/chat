# DynProtMobile

A comprehensive health and nutrition tracking application built with Next.js 15, featuring protein goal management, meal tracking, habit monitoring, and physical progress logging.

## 🚀 Features

### 🍽️ Meal Tracking
- **Photo-based meal logging** with multiple source options (manual, AI, scan, search)
- **Detailed nutritional breakdown** (protein, carbs, fat, calories)
- **Smart meal items management** with quantity and unit tracking
- **Date-based filtering** and meal history
- **Real-time macro calculations** with meal totals

### 🎯 Goal Management
- **Dynamic protein goals** with customizable targets
- **Date-range based goals** with automatic transitions
- **Historical goal tracking** and progress analysis
- **Smart goal overlap handling** to prevent conflicts

### 💪 Habit Tracking
- **Custom habit creation** with frequency targets (1-7 days/week)
- **Daily completion logging** with unique date constraints
- **Progress statistics** including completion rates
- **Archive functionality** for completed or paused habits

### 📊 Physical Progress
- **Multi-metric tracking**: weight, body fat percentage, height
- **Automatic BMI calculation** with intelligent height lookup
- **Progress change calculations** between entries
- **Time-based analytics** with days-since-last tracking

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **Multiple auth providers** support (local, Google, Apple, Facebook)
- **Password strength validation** with complexity requirements
- **User profile management** with secure email updates

## 🛠️ Technology Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: JWT with bcryptjs password hashing
- **Validation**: Zod schemas with comprehensive input validation
- **UI Components**: Radix UI with Tailwind CSS styling
- **Animations**: Framer Motion for smooth interactions
- **State Management**: Zustand for client-side state
- **Forms**: React Hook Form with resolver integration
- **Charts**: Recharts for data visualization
- **Testing**: Vitest with React Testing Library

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dynprotmobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/dynprotmobile
   JWT_SECRET=your-super-secure-jwt-secret-key
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb dynprotmobile
   
   # Run schema migration
   psql -d dynprotmobile -f database/schema.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── users/[id]/           # User profile management
│   │   ├── meals/                # Meal CRUD operations
│   │   ├── goals/                # Protein goal management
│   │   ├── habits/               # Habit tracking
│   │   └── progress/             # Physical progress logging
│   ├── (auth)/                   # Auth-protected pages
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (Radix)
│   └── ...                       # Feature-specific components
├── lib/                          # Utility libraries
│   ├── db.ts                     # Database connection & queries
│   ├── validation.ts             # Zod validation schemas
│   ├── auth.ts                   # JWT utilities
│   └── utils.ts                  # Common utilities
├── database/
│   └── schema.sql                # PostgreSQL schema
├── docs/                         # API documentation
└── types/                        # TypeScript type definitions
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/social` - Social authentication

### User Management
- `GET /api/users/[id]` - Get user profile
- `PATCH /api/users/[id]` - Update user profile
- `DELETE /api/users/[id]` - Delete user account

### Meals
- `GET /api/meals` - List user meals (with filtering)
- `POST /api/meals` - Create new meal
- `GET /api/meals/[id]` - Get meal details
- `PATCH /api/meals/[id]` - Update meal
- `DELETE /api/meals/[id]` - Delete meal

### Meal Items
- `POST /api/meals/[id]/items` - Add food item to meal
- `PATCH /api/meals/[id]/items/[itemId]` - Update food item
- `DELETE /api/meals/[id]/items/[itemId]` - Remove food item

### Goals
- `GET /api/goals` - Get active protein goal
- `POST /api/goals` - Create/update protein goal
- `GET /api/goals/history` - Get goal history

### Habits
- `GET /api/habits` - List user habits
- `POST /api/habits` - Create new habit
- `PATCH /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit

### Habit Logs
- `POST /api/habits/[id]/logs` - Log habit completion
- `GET /api/habits/[id]/logs` - Get habit logs
- `DELETE /api/habits/[id]/logs/[logId]` - Delete log

### Physical Progress
- `GET /api/progress` - Get progress entries
- `POST /api/progress` - Log new measurements

## 💾 Database Schema

### Core Tables
- **users**: User accounts with authentication
- **daily_goals**: Protein goals with date ranges
- **meals**: Meal entries with photo URLs
- **meal_items**: Individual food items with macros
- **habits**: User habits with frequency targets
- **habit_logs**: Daily habit completion tracking
- **physical_progress**: Weight, body fat, height, BMI logs

### Key Features
- **UUID primary keys** for security and scalability
- **CASCADE deletes** for data consistency
- **Check constraints** for data validation
- **Optimized indexes** for query performance
- **Automatic timestamps** with triggers

## 🧪 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

### Database Migrations
When schema changes are needed:
```bash
# Backup existing data
pg_dump dynprotmobile > backup.sql

# Apply new schema
psql -d dynprotmobile -f database/schema.sql

# Restore data if needed
```

## 🔒 Security Features

### Input Validation
- **Zod schemas** for all API endpoints
- **SQL injection prevention** with parameterized queries
- **XSS protection** through input sanitization
- **File upload validation** for meal photos

### Authentication Security
- **JWT tokens** with expiration
- **Password hashing** with bcryptjs
- **Secure password requirements** (8+ chars, mixed case, numbers)
- **Rate limiting** on authentication endpoints

### Data Protection
- **User data isolation** - users can only access their own data
- **Sensitive data exclusion** - password hashes never returned in API responses
- **Database constraints** prevent invalid data states

## 📱 Mobile Optimization

### Performance
- **Optimized database queries** with proper indexing
- **Pagination support** for large datasets
- **Efficient data structures** with calculated totals
- **Image optimization** for meal photos

### User Experience
- **Progressive Web App** capabilities
- **Responsive design** with Tailwind CSS
- **Touch-friendly interfaces** with proper hit targets
- **Offline-ready architecture** with service workers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use Prettier for code formatting  
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [API documentation](docs/) for endpoint details
- Review the database schema in `database/schema.sql`
- Open an issue for bugs or feature requests

## 🚀 Deployment

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

### Recommended Hosting
- **Vercel** for Next.js application
- **Supabase** or **Railway** for PostgreSQL database
- **Cloudinary** for image storage and optimization

---

Built with ❤️ for health and nutrition tracking
