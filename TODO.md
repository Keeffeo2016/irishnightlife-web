# IrishNightlife - Development TODO List

**Last Updated:** 2026-10-25

---

## ✅ COMPLETED

### Database & Backend
- [x] Supabase database connection configured
- [x] Database schema created (7 core tables)
- [x] Row Level Security (RLS) policies implemented
- [x] Triggers for auto-updating timestamps
- [x] User authentication setup

### Homepage UI
- [x] Clean, professional design (inspired by Kilkenny App)
- [x] All 32 Irish counties dropdown (grouped by province)
- [x] "What's On Tonight" hero section
- [x] Search functionality
- [x] County filter dropdown
- [x] Genre filter dropdown
- [x] Clean event card design
- [x] Responsive layout
- [x] Professional header and footer
- [x] Real-time filtering

---

## 🔄 IN PROGRESS

### Data Population
- [x] Scrape Cork venue data (25 venues added)
- [x] Scrape Cork event data (35 events added for this weekend)
- [ ] Scrape data for Dublin
- [ ] Scrape data for Galway
- [ ] Create seed data script for all cities

### Core Pages
- [x] Homepage (location-first with geolocation + live event count)
- [x] Venue listing page (clean card design)
- [x] Venue detail page
- [x] Event detail page
- [x] Tonight Planner UI (4-step wizard)
- [x] AI planner API route (deterministic scoring)
- [x] Plan result page
- [ ] "For Venues" landing page
- [ ] Sign up / Sign in pages

### Sunday Tasks
- [x] Location-first homepage refactor
- [x] Geolocation detection
- [x] Live event count display
- [x] "Explore Other Cities" section
- [ ] Add venue photos (Unsplash/Instagram)
- [ ] Mobile polish and testing
- [ ] Deploy to Vercel
- [ ] Record demo video/GIF
- [ ] Draft LinkedIn post

---

## 📋 TODO - HIGH PRIORITY

### Phase 1: Core Features (Week 1)
- [ ] Connect homepage to Supabase (replace sample data)
- [ ] Implement venue listing page with filters
- [ ] Implement venue detail page with events
- [ ] Implement event detail page
- [ ] Add venue signup flow
- [ ] Add venue dashboard (basic)
- [ ] Implement user authentication UI
- [ ] Add favorite/save functionality

### Phase 2: Advanced Features (Week 2)
- [ ] AI Night Planner (conversational interface)
- [ ] Real-time live updates (Supabase Realtime)
- [ ] Interactive map view (Leaflet)
- [ ] Booking integration
- [ ] Payment processing (Stripe)
- [ ] User reviews system
- [ ] Weekly email notifications

### Phase 3: Polish & Launch (Week 3)
- [ ] Mobile-responsive bottom navigation
- [ ] Image upload for venues/events
- [ ] Admin dashboard
- [ ] Analytics for venues
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Deploy to Vercel
- [ ] Domain setup

---

## 📋 TODO - MEDIUM PRIORITY

### UI/UX Improvements
- [ ] Loading states and skeletons
- [ ] Error handling UI
- [ ] Empty states design
- [ ] Toast notifications
- [ ] Modal dialogs
- [ ] Form validation
- [ ] Accessibility improvements (WCAG AA)

### Features
- [ ] Social sharing (events/venues)
- [ ] QR code check-in for venues
- [ ] Push notifications (mobile)
- [ ] Multi-language support
- [ ] Currency converter for tourists
- [ ] Weather integration (for outdoor events)

### Data & Content
- [ ] Scrape data for all 32 counties
- [ ] Add venue photos
- [ ] Add event photos
- [ ] Create venue categories
- [ ] Add opening hours data
- [ ] Import existing event listings

---

## 📋 TODO - LOW PRIORITY

### Nice-to-Have
- [ ] Dark mode toggle
- [ ] Advanced search (multi-criteria)
- [ ] Event recommendations (AI-powered)
- [ ] Venue comparison tool
- [ ] Group planning feature
- [ ] Integration with ticketing platforms
- [ ] API for third-party apps
- [ ] White-label solution for specific cities

### Marketing
- [ ] Landing page for SEO
- [ ] Blog section
- [ ] Newsletter signup
- [ ] Social media integration
- [ ] Referral program

---

## 🐛 BUGS & ISSUES

- [ ] Fix mobile navigation
- [ ] Optimize image loading
- [ ] Handle edge cases in date filtering
- [ ] Test RLS policies thoroughly
- [ ] Verify all triggers work correctly

---

## 📊 METRICS & GOALS

### Launch Goals
- [ ] 100+ venues listed
- [ ] 500+ events in database
- [ ] 1,000+ user signups (first month)
- [ ] 10+ venue subscriptions (first month)

### Performance Goals
- [ ] Page load time < 2 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile-friendly (100% responsive)
- [ ] Zero critical bugs at launch

---

## 📝 NOTES

### Design Decisions
- Clean, professional UI inspired by The Kilkenny App
- All 32 counties included (not just major cities)
- Focus on nightlife (18+, bars, clubs, live music)
- Mobile-first design approach

### Technical Decisions
- Next.js 16 with App Router
- Supabase for backend (auth, database, storage)
- Tailwind CSS + Shadcn/ui for styling
- TypeScript for type safety

### Data Sources
- The Kilkenny App (reference for UI/UX)
- Venue websites (for scraping data)
- Event listing sites (for event data)
- Manual entry (for premium venues)

---

**Next Actions:**
1. Scrape Cork venue and event data
2. Add sample data to database
3. Build venue listing page
4. Build venue detail page
5. Build event detail page
