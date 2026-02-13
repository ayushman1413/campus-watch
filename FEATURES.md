# CampusFind - Complete Feature Documentation

## Overview
CampusFind is a comprehensive campus-wide lost & found platform with AI-powered matching, real-time notifications, classroom finder, analytics dashboard, and community reputation system.

## Core Features

### 1. Lost & Found Management
- **Post Items**: Report lost or found items with detailed information
- **Search & Filter**: Search by category, location, date, or keywords
- **AI Matching**: Automatic suggestions for similar items
- **Image Support**: Upload and view item photos
- **Verification**: Security questions and OTP verification for claims

### 2. Item Categories
- Wallet
- Phone
- Keys
- Bag
- ID Card
- Electronics
- Accessories
- Documents
- Books
- Other

### 3. Campus Locations
- Library
- Cafeteria
- Hostel
- Classroom
- Playground
- Sports Complex
- Parking
- Medical Center
- Admin Building
- Other

### 4. User System
- **Profiles**: Complete user profiles with roles and departments
- **Statistics**: Track items lost, found, and recovered
- **Reputation System**: Earn points by helping others
- **Leaderboard**: Community recognition and rankings
- **Verification**: Email/phone verification for trusted users
- **Roles**: Student, Staff, Admin, Security personnel

### 5. Claims Management
- **Claim Requests**: Submit claims on found items
- **OTP Verification**: 6-digit OTP for identity verification
- **Status Tracking**: Pending, Approved, Rejected states
- **Communication**: Message exchange between claimant and owner
- **History**: Complete claim resolution timeline

### 6. Classroom Finder
- **Browse Classrooms**: View all campus classrooms
- **Building Navigation**: Filter by building/block
- **Real-time Availability**: Check room availability
- **Room Details**: Capacity, amenities, floor information
- **Search**: Quick search for specific classrooms
- **Statistics**: Campus-wide occupancy analytics

### 7. Notifications System
- **Real-time Alerts**: Instant notifications for claims
- **Notification Types**:
  - Claim notifications
  - Message alerts
  - AI match suggestions
  - Status updates
  - Security incidents
  - Announcements
- **Notification Management**: Mark as read, archive, delete
- **Unread Counter**: Badge showing unread count
- **Notification History**: Archive all past notifications

### 8. Analytics Dashboard (Admin)
- **Dashboard Stats**: Total items, success rates, active users
- **Category Analytics**: Top lost/found categories
- **Location Analytics**: Items by campus location
- **Monthly Trends**: Historical tracking over 6 months
- **Lost/Found Ratio**: Distribution analysis
- **Success Rate Metrics**: Claim approval rates
- **User Statistics**: Active member tracking

### 9. Community Features
- **Leaderboard**: Top 50 contributors ranked by reputation
- **Reputation Points**: Earned through successful item recovery
- **Badges**: Member, Helper, Expert badges based on activity
- **User Search**: Find other users in the community
- **Activity Tracking**: View user activity history

### 10. Advanced Features
- **AI-Powered Matching**: Suggests similar items using:
  - Category matching
  - Color similarity
  - Location proximity
  - Item type correlation
- **Bulk Notifications**: Send notifications to multiple users
- **Smart Search**: Full-text search across all fields
- **Date Filtering**: Find items by specific dates
- **Multi-filter Support**: Combine multiple search criteria

## API Endpoints (Backend)

### Items API (`/lib/api/items.ts`)
- `fetchItems()` - Get all items with filters
- `getItem()` - Get single item details
- `createItem()` - Post new item
- `updateItem()` - Update item details
- `deleteItem()` - Remove item
- `searchItems()` - Search with query
- `getAIMatches()` - Get AI suggestions

### Claims API (`/lib/api/claims.ts`)
- `getUserClaims()` - Get user's claims
- `getItemClaims()` - Get claims for item
- `createClaim()` - Submit new claim
- `updateClaim()` - Update claim
- `approveClaim()` - Approve with OTP
- `rejectClaim()` - Reject claim
- `verifyOTP()` - Verify OTP code

### Users API (`/lib/api/users.ts`)
- `getProfile()` - Get user profile
- `updateProfile()` - Update profile
- `getUserStats()` - Get user statistics
- `getLeaderboard()` - Get top users
- `updateReputation()` - Add reputation points
- `verifyUser()` - Mark as verified
- `getUserActivity()` - Get user history

### Classrooms API (`/lib/api/classrooms.ts`)
- `getAllBlocks()` - Get all buildings
- `getClassroomsByBlock()` - Get rooms in building
- `getAvailableClassrooms()` - Get free rooms
- `searchClassrooms()` - Search rooms
- `updateClassroomStatus()` - Update availability
- `getStatistics()` - Get occupancy data

### Notifications API (`/lib/api/notifications.ts`)
- `getUserNotifications()` - Get all notifications
- `getUnreadNotifications()` - Get unread only
- `getUnreadCount()` - Count unread
- `createNotification()` - Send notification
- `markAsRead()` - Mark single as read
- `markAllAsRead()` - Read all notifications
- `deleteNotification()` - Remove notification

### Analytics API (`/lib/api/analytics.ts`)
- `getDashboardStats()` - Main metrics
- `getCategoryStats()` - Category breakdown
- `getLocationStats()` - Location distribution
- `getMonthlyTrends()` - Historical trends
- `getUserStats()` - User-specific data
- `getLostFoundRatio()` - Distribution ratio
- `getClaimResolutionTime()` - Average resolution time

## State Management (Zustand Stores)

### `useItemsStore`
- Items list and filtering
- Search functionality
- AI matches
- Loading and error states

### `useClaimsStore`
- User claims management
- Claim creation and updates
- OTP verification
- Status tracking

### `useUserStore`
- User profiles
- Statistics and leaderboard
- Reputation management
- User activity

### `useClassroomStore`
- Classroom data
- Building information
- Availability tracking
- Statistics

### `useNotificationStore`
- Notifications list
- Unread count
- Read/archive management
- Notification creation

## Pages

### Public Pages
- `/` - Home with browsing and search
- `/leaderboard` - Community rankings
- `/classroom-finder` - Classroom finder with filters

### Protected Pages (Authenticated Users)
- `/profile` - User profile and statistics
- `/post-item` - Report lost/found items
- `/my-claims` - Manage claims on items
- `/notifications` - Notification center
- `/admin/dashboard` - Analytics dashboard (Admin)

## Technology Stack
- **Framework**: Next.js 14 with App Router
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Data Models

### Items
- id, user_id, title, description, category, location
- status, item_type, image_urls, color
- distinguishing_marks, date_found_lost
- ai_match_score, ai_suggestions, is_claimed
- tags, verification_question
- created_at, updated_at

### Claims
- id, item_id, claimant_id, item_owner_id
- status, verification_answer, message, otp
- otp_expires_at, created_at, updated_at
- resolved_at

### Profiles
- id, user_id, name, email, phone
- avatar_url, department, roll_number
- hostel_block, room_number, role
- is_verified, reputation_score
- items_found, items_lost, success_rate
- created_at, updated_at

### Notifications
- id, user_id, type, title, message
- status, related_item_id, related_claim_id
- action_url, created_at, read_at

### Classrooms
- id, block_id, room_number, floor
- capacity, amenities, is_available
- last_updated

## Security Features
- Supabase Row Level Security (RLS) for database access control
- OTP verification for claim approval
- User verification badges
- Admin role-based access
- Secure session management
- Input validation with Zod schemas

## Performance Optimizations
- Efficient API calls with filtering
- Zustand state management for reduced re-renders
- Lazy loading of components
- Image optimization
- Pagination support (built-in Supabase)
- Database indexing on common queries

## Future Enhancements
- Email notifications integration
- SMS alerts for high-priority items
- Mobile app version
- Real-time WebSocket updates
- Item recovery statistics export
- Campus map integration
- QR code item tracking
- Social sharing features
- Integration with campus security system
- Automated lost item cleanup

## Error Handling
- User-friendly error messages
- Toast notifications for feedback
- Graceful fallbacks for failed operations
- Console logging for debugging
- Error boundary components

## Testing Coverage
The project includes comprehensive error handling and validation:
- Form input validation with Zod
- API error handling with try-catch
- Loading states for all async operations
- Empty state handling
- Network error recovery

## Deployment Notes
- Requires Supabase project setup
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Database migrations for table creation
- Vercel hosting compatible
- Automatic CI/CD with GitHub integration

## Support & Documentation
All API methods are well-documented with TypeScript interfaces and JSDoc comments. See individual files in `/lib/api/` for detailed function documentation.
