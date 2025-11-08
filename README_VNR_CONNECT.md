# VNR Connect

**For Students, By Students (Guided by Alumni)**

VNR Connect is a comprehensive student engagement platform built for VNR college, connecting students with alumni mentors, enabling peer-to-peer knowledge sharing, and providing academic resources all in one place.

## 🚀 Features

### Phase 1 (MVP) - COMPLETED
- ✅ **Alumni Network & Mentorship**: Connect with 500+ alumni from top companies
- ✅ **Ask VNR (Query Feed)**: Real-time Q&A platform with upvoting, flagging, and anonymous posting
- ✅ **Events & Clubs**: Discover hackathons, workshops, and club activities
- ✅ **Internship Board**: Find opportunities recommended by alumni
- ✅ **Academic Resource Hub**: Access verified notes, papers, and study materials with filters
- ✅ **Reputation System**: Earn points and badges for helping the community
- ✅ **Moderation System**: Auto-hide flagged content, profanity filtering

### Phase 2 (Foundation Ready)
- ✅ **Database Schema**: Complete PostgreSQL schema with RLS policies
- ✅ **Real-time Updates**: Live query feed with Supabase subscriptions
- ✅ **Role-Based Access**: Student, Alumni, Faculty, Moderator, Admin roles
- 🔄 **Mentorship Rooms**: Topic-based channels + 1:1 booking (UI pending)
- 🔄 **Admin Panel**: Moderation queue for content approval (UI pending)

## 🎨 Design System

**Color Palette:**
- VNR Blue: `#0057B7` (Primary)
- Neon Yellow: `#FFD500` (Accent)
- Soft Lilac: `#A58CFF` (Secondary)
- Neutral Light: `#F7F8FA` (Surface)
- Dark BG: `#0F1724` (Dark Mode)

**Typography:**
- Headings: Poppins (400-800)
- Body: Inter (300-700)

**Components:**
- Rounded corners: 12px (--radius: 0.75rem)
- Hover effects: Lift animation (-6px translate)
- Shadows: Soft, Medium, Lifted variations

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Date Utilities**: date-fns

### Backend (Lovable Cloud / Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth (Email/Password with auto-confirm)
- **Real-time**: Supabase Subscriptions
- **Storage**: Supabase Storage (ready for file uploads)
- **Edge Functions**: Ready for serverless logic

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd vnr-connect

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

The project uses Lovable Cloud, so environment variables are auto-configured. If you need to connect to a different Supabase project, update `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🗄️ Database Schema

### Core Tables
- **profiles**: User profiles with role, reputation, skills
- **queries**: Questions with category, votes, flags, anonymous support
- **replies**: Answers to queries with voting and accepted answer
- **alumni_posts**: Interview experiences and career insights
- **resources**: Academic materials with verification system
- **events**: College events and activities
- **internships**: Job opportunities
- **mentorship_rooms**: Topic channels and 1:1 sessions
- **bookings**: Mentor session scheduling
- **badges**: Gamification badges
- **badge_assignments**: User badge achievements
- **moderation_logs**: Content moderation history
- **notifications**: User notifications

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Anonymous posting with privacy protection
- Moderation queue for sensitive content

## 🎯 Key Features Explained

### 1. Ask VNR (Query Feed)
- **Real-time updates**: New queries appear instantly via Supabase subscriptions
- **Anonymous posting**: Users can ask sensitive questions privately
- **Auto-moderation**: 3 flags = auto-hide for moderator review
- **Profanity filter**: Basic client-side filtering before submission
- **Voting system**: Upvote helpful questions and answers
- **Status tracking**: Mark queries as OPEN or SOLVED

### 2. Alumni Network
- **Filter by**: Company, Role, Batch, Branch
- **Search**: Find alumni by name or company
- **Reputation display**: See most helpful contributors
- **Mentorship**: Direct connection with alumni mentors

### 3. Academic Resources
- **Multi-level filters**: Branch → Semester → Subject → Type
- **Resource types**: Notes, Previous Papers, Model Papers, Concepts, Extra Resources
- **Verification system**: Moderator-approved content gets verified badge
- **Upload permissions**: Authenticated users can contribute

### 4. Reputation & Gamification
**Point System:**
- +10 points: Verified resource upload
- +5 points: Accepted answer
- +2 points: Upvote received
- -5 points: Valid flag against your content

**Badges:**
- 🌟 Top Helper
- 📚 Academic Guru
- 🎯 Mentor
- ✨ New Contributor

### 5. Moderation System
- **Three-flag rule**: Content auto-hidden at 3 flags
- **Moderator queue**: Review flagged and anonymous content
- **Action logging**: All moderation actions tracked
- **Role hierarchy**: Student Moderators → Faculty → Core Team → Admin

## 🔒 Authentication Flow

1. **Sign Up**: Email + Password → Auto-confirmed (no email verification needed for development)
2. **Onboarding**: Role selection → Branch/Year (Students) or Company/Batch (Alumni)
3. **Profile Creation**: Skills, interests, goals optional
4. **Dashboard**: Personalized based on role and interests

## 📱 Pages & Routes

### Public Routes
- `/` - Landing page with features showcase
- `/auth` - Sign in / Sign up

### Protected Routes (under `/app`)
- `/app/dashboard` - Personalized dashboard with stats and quick actions
- `/app/ask-vnr` - Live query feed
- `/app/alumni` - Alumni directory with filters
- `/app/resources` - Academic resource library
- `/app/events` - Events calendar and listings
- `/app/internships` - Internship opportunities board

### Coming Soon
- `/app/mentorship` - Mentorship rooms and 1:1 booking
- `/app/admin` - Moderation panel (Moderator/Admin only)
- `/profile/:id` - User profile pages

## 🧪 Sample Data

The database includes seed data with:
- 4 badges (Top Helper, Academic Guru, Mentor, New Contributor)
- 15 sample queries across all categories
- 10 upcoming events
- 8 internship opportunities (4 alumni-recommended)
- 15 academic resources across branches

## 🚀 Deployment

### Via Lovable
1. Click "Publish" in the Lovable editor
2. Your app will be deployed with a `.lovable.app` domain
3. Connect a custom domain in Settings if needed

### Via Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Setup
Lovable Cloud handles backend automatically. For manual Supabase:
1. Create a Supabase project
2. Run migrations from `supabase/migrations`
3. Update environment variables
4. Configure Auth URLs in Supabase dashboard

## 🔧 Configuration

### Auth Settings (Supabase Dashboard)
- Site URL: `https://your-domain.lovable.app`
- Redirect URLs: Add your preview and production URLs
- Email Auth: Enabled with auto-confirm for development

### Storage Buckets (Coming Soon)
For file uploads, create these buckets:
- `resources` - Academic files (PDF, DOC)
- `avatars` - User profile pictures (Public)
- `event-posters` - Event images (Public)

## 📝 Development Guidelines

### Code Structure
```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   └── AppLayout.tsx # Main app layout with nav
├── pages/            # Route pages
├── hooks/            # Custom React hooks
├── integrations/     # Supabase client (auto-generated)
└── lib/             # Utility functions
```

### Adding a New Feature
1. **Database**: Create migration if schema changes needed
2. **Types**: Types auto-generate from schema
3. **UI**: Create page component in `src/pages/`
4. **Route**: Add route in `src/App.tsx`
5. **Nav**: Update `AppLayout.tsx` navigation

### Design System Usage
```tsx
// ✅ CORRECT - Use semantic tokens
<Button variant="default">Click Me</Button>
<Card className="hover-lift">...</Card>

// ❌ WRONG - Don't use direct colors
<button className="bg-blue-600">Click Me</button>
```

## 🐛 Common Issues

### Auth Redirect Error
**Problem**: "requested path is invalid" or redirects to localhost
**Solution**: Configure Site URL and Redirect URLs in Auth settings

### RLS Policy Error
**Problem**: "new row violates row-level security policy"
**Solution**: Ensure `user_id` column is set correctly in INSERT statements

### Real-time Not Working
**Problem**: Changes don't appear instantly
**Solution**: Check that table is added to `supabase_realtime` publication

## 🎯 TODOs for Production

### Critical
- [ ] Implement SSO (College email domain validation)
- [ ] Add email notifications system
- [ ] Implement file upload for resources
- [ ] Build admin moderation panel UI
- [ ] Add rate limiting (prevent spam)
- [ ] Implement comprehensive profanity filter
- [ ] Add search functionality (Algolia optional)

### Nice to Have
- [ ] AI-powered query suggestions
- [ ] Auto-tagging for uploads
- [ ] Mobile app (React Native)
- [ ] PWA with offline support
- [ ] Analytics dashboard
- [ ] Leaderboard page
- [ ] Alumni verification system
- [ ] Video/voice call integration for mentorship

## 🤝 Contributing

This platform is built by students for students. Contributions welcome!

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript strict mode
- Follow existing component patterns
- Use semantic color tokens from design system
- Add comments for complex logic
- Write accessible HTML (proper ARIA labels)

## 📄 License

This project is open source and available for educational use.

## 👥 Team

Built with ❤️ by VNR students for the VNR community.

## 📞 Support

For issues or questions:
- GitHub Issues: [Your Repo]
- Discord: [VNR Connect Community]
- Email: support@vnrconnect.app

---

**Remember**: This platform is For Students, By Students (Guided by Alumni). Let's build something amazing together! 🚀
