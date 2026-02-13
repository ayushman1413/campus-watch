# CampusFind - Deployment Guide

## Prerequisites
- Supabase account
- Vercel account
- GitHub account (for continuous deployment)
- Node.js 18+ and pnpm

## Step-by-Step Deployment

### 1. Supabase Setup

#### Create Project
1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and anon key

#### Create Database Tables

```sql
-- Users/Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  department VARCHAR(100),
  roll_number VARCHAR(50),
  hostel_block VARCHAR(50),
  room_number VARCHAR(50),
  role VARCHAR(50) DEFAULT 'student',
  is_verified BOOLEAN DEFAULT false,
  reputation_score INTEGER DEFAULT 0,
  items_found INTEGER DEFAULT 0,
  items_lost INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Items
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  location VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  item_type VARCHAR(20) NOT NULL,
  image_url TEXT,
  images TEXT[],
  color VARCHAR(50),
  distinguishing_marks TEXT,
  date_found_lost DATE,
  ai_match_score FLOAT,
  ai_suggestions TEXT[],
  is_claimed BOOLEAN DEFAULT false,
  verification_question TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Claims
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  claimant_id UUID NOT NULL,
  item_owner_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  verification_answer TEXT,
  message TEXT,
  otp VARCHAR(10),
  otp_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'unread',
  related_item_id UUID,
  related_claim_id UUID,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- Classroom Blocks
CREATE TABLE classroom_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  building_code VARCHAR(50),
  floor_count INTEGER,
  description TEXT,
  location VARCHAR(255),
  capacity INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Classrooms
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  floor INTEGER,
  capacity INTEGER,
  amenities TEXT[],
  is_available BOOLEAN DEFAULT true,
  availability_schedule JSONB,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_type ON items(item_type);
CREATE INDEX idx_items_claimed ON items(is_claimed);
CREATE INDEX idx_claims_claimant ON claims(claimant_id);
CREATE INDEX idx_claims_owner ON claims(item_owner_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_classrooms_block ON classrooms(block_id);
```

#### Enable Row Level Security (RLS)
```sql
-- Items RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all items"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

-- Add similar policies for other tables as needed
```

### 2. Environment Variables Setup

Create `.env.local` in project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Local Testing

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Visit http://localhost:3000
```

### 4. GitHub Setup

```bash
# Initialize git if not done
git init

# Add all files
git add .

# Commit
git commit -m "Initial CampusFind deployment"

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/yourusername/campusfind.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 5. Vercel Deployment

#### Option A: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select your GitHub repository
4. Add environment variables in Settings
5. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables when prompted
# Redeploy
vercel --prod
```

### 6. Verify Deployment

After deployment:
1. Visit your Vercel URL
2. Test home page functionality
3. Test search and filtering
4. Create test account
5. Post a test item
6. Test claim flow
7. Check notifications
8. Verify admin dashboard

## Production Checklist

- [ ] Supabase database created
- [ ] All tables created with indexes
- [ ] RLS policies enabled
- [ ] Environment variables set in Vercel
- [ ] GitHub repository connected
- [ ] Domain configured (optional)
- [ ] SSL enabled (automatic on Vercel)
- [ ] Email notifications configured (optional)
- [ ] Backup system configured
- [ ] Error monitoring enabled (optional)

## Troubleshooting

### Database Connection Issues
```bash
# Check Supabase URL and key in .env.local
# Verify database is accessible
# Check RLS policies aren't blocking access
```

### Authentication Problems
```bash
# Ensure Supabase Auth is enabled
# Check User table exists
# Verify auth policies are correct
```

### Performance Issues
```bash
# Check database indexes
# Monitor Supabase metrics
# Review slow queries
# Implement pagination if needed
```

## Monitoring

### Supabase Monitoring
- Visit https://supabase.com/dashboard
- Check database performance
- Monitor API usage
- Review authentication logs

### Vercel Monitoring
- Visit https://vercel.com/dashboard
- Check deployment status
- Review build logs
- Monitor analytics

## Scaling Considerations

### Database
- Use connection pooling for high traffic
- Implement query optimization
- Add caching layer if needed

### Frontend
- Enable image optimization
- Use CDN for static assets
- Implement pagination for large lists

### Backend
- Rate limiting for APIs
- Request validation
- Error tracking with Sentry

## Backup & Recovery

### Database Backups
1. Enable automatic backups in Supabase
2. Configure backup retention
3. Test backup restoration

### Code Backups
1. GitHub is your code backup
2. Enable branch protection
3. Require PR reviews

## Security Hardening

- [ ] Enable HTTPS
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use environment variables
- [ ] Enable audit logs
- [ ] Regular security updates
- [ ] SSL certificate monitoring

## Maintenance Tasks

### Weekly
- Monitor error logs
- Check database performance
- Review user feedback

### Monthly
- Update dependencies
- Review security advisories
- Analyze usage patterns

### Quarterly
- Performance optimization
- Feature updates
- Security audit

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Community: Discord, GitHub Discussions

## Common Issues & Solutions

### Issue: "Supabase key not found"
**Solution**: Check .env.local has correct values

### Issue: "Database connection timeout"
**Solution**: Verify network access, check Supabase status

### Issue: "Deployment fails"
**Solution**: Check build logs on Vercel, verify node version

### Issue: "RLS blocking writes"
**Solution**: Check RLS policies, enable proper permissions

## Post-Deployment Steps

1. Create admin account
2. Populate with sample data
3. Test all features thoroughly
4. Set up monitoring
5. Configure error tracking
6. Add custom domain (optional)
7. Set up CDN (optional)
8. Configure analytics (optional)

## Performance Optimization

After deployment:
1. Enable image optimization
2. Set up caching headers
3. Minify assets
4. Enable gzip compression
5. Configure database connection pooling
6. Set up redis caching (optional)

## Going Live

Before going live with real users:
1. Complete security audit
2. Load testing
3. Backup testing
4. User acceptance testing
5. Performance benchmarking
6. Disaster recovery plan
7. Monitoring setup
8. Support system ready

This completes the CampusFind deployment! The platform is now live and ready for campus use.
