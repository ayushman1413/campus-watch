# 🚀 Quick Start Guide

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎭 Demo Credentials

### Admin Account
- Email: `admin@university.edu`
- Password: `admin123`
- Access: Full admin panel with moderation tools

### Regular User Account
- Email: `sarah.j@university.edu`
- Password: `password123`
- Access: Standard user features

## 🎯 Feature Walkthrough

### 1. Browse Items (No login required)
- Visit homepage
- Switch between "Lost Items" and "Found Items" tabs
- Use search bar to filter items
- Click any item to view details

### 2. Login
- Click "Login" button in navbar
- Use demo credentials above
- Or click "Continue with Google" for quick login

### 3. Report a Lost/Found Item
- Click "Report Item" in navbar (requires login)
- Toggle "I Lost Something" or "I Found Something"
- Fill in all required fields:
  - Title (min 5 characters)
  - Description (min 20 characters)
  - Category
  - Location
  - Date
  - Verification question (for lost items)
- Upload an image
- Click "Analyze & Report"
- Watch AI generate tags
- View possible matches

### 4. Claim an Item
- Browse items and click "View Details"
- Click "Claim This Item" button
- Answer verification question (if required)
- Send a message explaining your claim
- Submit and wait for approval

### 5. Manage Your Posts
- Go to "Dashboard" from navbar
- **My Posts tab:**
  - View all your posted items
  - See claims count
  - Click "View Claims" to see who claimed
  - Approve/reject claims
  - Get OTP for approved claims
  - Delete items
- **My Claims tab:**
  - See items you've claimed
  - Check claim status
  - View OTP for approved claims
  - Mark items as returned

### 6. Chat with Users
- After claiming or having your item claimed
- Navigate to dashboard
- Click on a claim to open chat
- Send messages back and forth
- Coordinate item handover
- OTP is displayed in chat for approved claims

### 7. Admin Functions (Admin only)
- Login with admin credentials
- Click "Admin Panel" in navbar
- View platform statistics:
  - Total items
  - Lost vs Found breakdown
  - Total claims
  - Pending/approved claims
- Manage all items:
  - View all posts
  - See all claims
  - Toggle item status (active/closed)
  - Delete any item
- Monitor all platform activity

## 💡 Tips

1. **Explore Mock Data**: The app comes with 8 pre-loaded items and sample claims
2. **Try Different Users**: Login as different users to see various perspectives
3. **Test Full Flow**: Report → Claim → Approve → Chat → Mark Returned
4. **Check Responsiveness**: Try on mobile/tablet view
5. **LocalStorage**: All data persists in your browser

## 🎨 UI Features to Notice

- Smooth animations on page load
- Skeleton loaders while "analyzing"
- Toast notifications for actions
- Empty states when no data
- Hover effects on cards
- Status badges with color coding
- Responsive grid layouts
- Modal dialogs for multi-step forms

## 🔧 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3000
npx kill-port 3000
# Then run dev again
npm run dev
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors?**
```bash
# The app should still run, but you can check with:
npm run build
```

## 📱 Mobile Testing

The app is fully responsive. Test on:
- Chrome DevTools mobile view
- Actual mobile device (use local IP)
- Tablet breakpoints

## 🎯 What to Try

1. ✅ Report a lost wallet with verification question
2. ✅ Find that wallet and claim it
3. ✅ Approve the claim and get OTP
4. ✅ Chat with the claimant
5. ✅ Mark as returned using OTP
6. ✅ Try admin panel to moderate
7. ✅ Search and filter items
8. ✅ View AI-generated matches

Enjoy exploring CampusFind! 🎉
