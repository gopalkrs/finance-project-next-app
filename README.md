# 💰 Finance Project - Next.js App

A full-stack finance management application built with **Next.js**, **TailwindCSS**, Clerk, Supabase, GenAI, PostgreSQL(with Prisma), Server Actions. This project focuses on delivering a smooth, modern, and performant experience for managing financial transactions, budget tracking, and insights.

---

## 🚀 Tech Stack

- **Frontend**: Next.js (App Router), React 18, TailwindCSS
- **Backend API**: Custom API routes in Next.js and Server Actions
- **Database**: PostgreSQL (via Prisma ORM), hosted on Supabase
- **Authentication**: Clerk
- **Deployment**: Vercel

---

## ✨ Features

- ✅ **User Authentication**: Secure auth login via Clerk Auth
- ✅ **Transaction Management**: Add, update, and delete financial transactions manually or smart AI upload.
- ✅ **Budget Tracking**: Visualize budgets and spending patterns
- ✅ **Dynamic Dashboard**: Clean, real-time UI using React Query and Zustand
- ✅ **Fully Responsive UI**: Built mobile-first with TailwindCSS
- ✅ **Protected Routes**: Server-side and client-side route protection
- ✅ **API Integration**: RESTful APIs built directly in Next.js routes
- ✅ **Deployment Ready**: CI/CD ready and fully deployed on Vercel

---

## 📂 Folder Structure (High Level)


```
finance-project-next-app/
│
├── app/                 # Next.js App Router
├── components/          # UI components
├── lib/                 # Utility functions and API clients
├── store/               # Zustand state management
├── db/                  # Database setup using Drizzle ORM
├── schema/              # Zod validation schemas
├── public/              # Static assets
└── styles/              # Tailwind global styles
```

🖥️ Live Demo
Deployed on Vercel 👉 Live App
https://debbit-app.vercel.app/

🧑‍💻 Getting Started Locally
1️⃣ Clone the repository
bash
Copy
Edit
git clone https://github.com/gopalkrs/finance-project-next-app.git
cd finance-project-next-app
2️⃣ Install dependencies
bash
Copy
Edit
npm install
# or
yarn install
3️⃣ Configure Environment Variables
Create a .env.local file in the root directory with necessary credentials:

env
Copy
Edit
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
4️⃣ Run the development server
bash
Copy
Edit
npm run dev
# or
yarn dev
🏷️ Why this project?
This project demonstrates:

Full-stack web development using modern frameworks like Nextjs, uses GENAI features.

Clean code architecture with scalable state management

Real-world production-grade authentication system

Seamless integration of backend and frontend using Next.js


