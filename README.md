# Sales Dashboard Pro 📊

A production-ready SaaS sales dashboard application built with React, Supabase, and modern web technologies. Features a complete dark/light theme system with WCAG 2.1 AA/AAA compliant colors for optimal accessibility and user experience.

## ✨ Features

### Core Functionality
- **Real-time Sales Tracking**: Live updates using Supabase real-time subscriptions
- **Role-Based Access Control**: Admin and Sales Rep roles with different permissions
- **Interactive Charts**: Visual representation of sales performance
- **Deal Management**: Add, track, and visualize sales deals

### Design & UX
- **🌓 Dark/Light Mode**: Production-grade theme system with:
  - WCAG AA/AAA compliant color contrasts
  - Smooth transitions between themes
  - System preference detection
  - Persistent theme selection
- **♿ Accessibility First**: 
  - Proper ARIA labels and roles
  - Keyboard navigation support
  - Screen reader optimized
  - Focus management
- **📱 Responsive Design**: Mobile-first approach with breakpoints
- **⚡ Performance Optimized**: 
  - Code splitting
  - Lazy loading
  - Optimized bundle sizes

### Authentication & Security
- Secure authentication with Supabase Auth
- Protected routes
- Session management
- Email/password authentication

## 🚀 Tech Stack

- **Frontend**: React 19 with Hooks
- **Routing**: React Router DOM v7
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Charts**: React Charts
- **Build Tool**: Vite
- **Styling**: CSS with CSS Variables for theming
- **Code Quality**: ESLint

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account and project

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sales-dashboard-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**

   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Create user_profiles table
   CREATE TABLE user_profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     account_type TEXT NOT NULL CHECK (account_type IN ('admin', 'rep')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create sales_deals table
   CREATE TABLE sales_deals (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
     value DECIMAL(10, 2) NOT NULL CHECK (value >= 0),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE sales_deals ENABLE ROW LEVEL SECURITY;

   -- Create policies for user_profiles
   CREATE POLICY "Users can view all profiles" 
     ON user_profiles FOR SELECT 
     TO authenticated 
     USING (true);

   CREATE POLICY "Users can insert their own profile" 
     ON user_profiles FOR INSERT 
     TO authenticated 
     WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update their own profile" 
     ON user_profiles FOR UPDATE 
     TO authenticated 
     USING (auth.uid() = id);

   -- Create policies for sales_deals
   CREATE POLICY "Users can view all deals" 
     ON sales_deals FOR SELECT 
     TO authenticated 
     USING (true);

   CREATE POLICY "Users can insert deals" 
     ON sales_deals FOR INSERT 
     TO authenticated 
     WITH CHECK (true);

   -- Create function to auto-create user profile on signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.user_profiles (id, name, account_type)
     VALUES (
       NEW.id,
       NEW.raw_user_meta_data->>'name',
       NEW.raw_user_meta_data->>'account_type'
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Create trigger for new user signup
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

   -- Enable real-time for both tables
   ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
   ALTER PUBLICATION supabase_realtime ADD TABLE sales_deals;
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` folder.

## 📁 Project Structure

```
sales-dashboard-pro/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── Form.jsx         # Deal submission form
│   │   ├── Header.jsx       # App header with theme toggle
│   │   ├── ProtectedRoute.jsx
│   │   ├── Signin.jsx
│   │   └── Signup.jsx
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── ThemeContext.jsx # Theme management
│   ├── routes/              # Route components
│   │   ├── Dashboard.jsx    # Main dashboard view
│   │   └── RootRedirect.jsx
│   ├── utils/               # Utility functions
│   │   └── theme.js         # Theme configuration
│   ├── index.css            # Global styles with theme variables
│   ├── main.jsx             # App entry point
│   ├── router.jsx           # Route configuration
│   └── supabase-client.js   # Supabase client setup
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── index.html               # HTML template
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Theme System

The application includes a sophisticated theme system:

### Color Palette
- **Light Mode**: Soft whites, grays, and vibrant greens
- **Dark Mode**: Deep charcoals with desaturated colors for comfort

### Implementation
- CSS Variables for dynamic theming
- LocalStorage persistence
- System preference detection
- Smooth transitions
- WCAG compliant contrast ratios

### Usage
Users can toggle between light and dark mode using the theme button in the header. The preference is saved and persists across sessions.

## 🔐 Security Features

- Environment variables for sensitive data
- Row Level Security (RLS) in Supabase
- Protected routes with authentication checks
- Secure session management
- Input validation and sanitization

## ♿ Accessibility

- WCAG 2.1 AA compliance minimum
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management
- Reduced motion support

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px
- Touch-friendly interface
- Flexible layouts

## 🧪 Testing

To lint your code:
```bash
npm run lint
```

## 🚢 Deployment

### Vercel
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Netlify
1. Push to GitHub
2. Connect repository in Netlify
3. Add environment variables
4. Deploy

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_KEY` | Your Supabase anon/public key | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💡 Usage Tips

### For Admins
- View all sales representatives' performance
- Add deals for any team member
- Monitor team-wide metrics

### For Sales Reps
- Track personal sales performance
- Add new deals quickly
- View real-time updates

## 🐛 Troubleshooting

**Theme not persisting?**
- Check browser localStorage settings
- Ensure JavaScript is enabled

**Real-time updates not working?**
- Verify Supabase real-time is enabled
- Check network connection
- Review Supabase project settings

**Authentication issues?**
- Verify environment variables
- Check Supabase auth settings
- Review RLS policies

## 📞 Support

For issues and questions:
1. Check the documentation
2. Review existing GitHub issues
3. Create a new issue with details

## 🎯 Roadmap

- [ ] Email notifications
- [ ] Export reports to PDF/Excel
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] Integration with CRM systems

---

Built with ❤️ using React and Supabase