# 👋 Gawin - Your Pocket AI Companion

> Your pocket AI companion, tutor and chat buddy... built for learners and dreamers

## 🚀 Features

- **🎓 AI Academy** - Interactive AI learning courses
- **💻 Coding Bootcamp** - Full-stack development training
- **🤖 Robotics Lab** - Hands-on robotics projects
- **🎨 Creative Studio** - AI-powered creative tools
- **🧮 Smart Calculator** - Advanced mathematical computations
- **📝 Grammar Checker** - Real-time writing assistance
- **🌍 Universal Translator** - Multi-language support
- **🔢 Math Solver** - Step-by-step problem solving

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **Authentication**: Custom auth system
- **AI Integration**: Groq SDK
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gawin-ai.git
   cd gawin-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run build:analyze` - Analyze bundle size

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Automatic deployments on push

## 🏗️ Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── academy/           # AI Academy pages
│   │   ├── bootcamp/          # Coding Bootcamp
│   │   ├── tutor/             # Tutor tools
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   └── ...
│   ├── lib/                   # Utility functions
│   └── styles/               # Global styles
├── public/                    # Static assets
├── middleware.ts             # Next.js middleware
├── next.config.ts           # Next.js configuration
└── tailwind.config.ts       # Tailwind configuration
```

## 🔒 Security Features

- **CSP Headers** - Content Security Policy protection
- **XSS Protection** - Cross-site scripting prevention
- **CSRF Protection** - Cross-site request forgery protection
- **Rate Limiting** - API request throttling
- **Input Sanitization** - DOMPurify for safe HTML
- **Secure Headers** - Comprehensive security headers

## 🎨 Design System

- **Colors**: Custom turquoise (#00A3A3) brand palette
- **Typography**: System fonts with clean hierarchy
- **Components**: Apple-inspired glassmorphism design
- **Responsive**: Mobile-first responsive design
- **Animations**: Smooth micro-interactions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Vercel** - For excellent deployment platform
- **Supabase** - For backend services
- **Tailwind CSS** - For utility-first styling

---

<div align="center">
  <p>Made with ❤️ by the KreativLoops AI Team</p>
</div>