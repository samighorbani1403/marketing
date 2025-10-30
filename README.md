# Marketing Website

A modern, responsive marketing website built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS for styling
- 📱 Responsive design
- 🔧 TypeScript support
- 🚀 Optimized performance
- 🗄️ Prisma ORM for database management
- 📝 Contact form with database integration

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (local or cloud)

## Getting Started

### 1. Installation

Install dependencies:
```bash
npm install
# or
yarn install
```

### 2. Database Setup

1. Copy the environment variables template:
```bash
cp env.example .env.local
```

2. Update `.env.local` with your database connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/marketing_db?schema=public"
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Push the schema to your database:
```bash
npm run db:push
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

## Database Schema

The project includes the following models:

- **User** - User accounts with authentication
- **Post** - Blog posts/articles
- **Contact** - Contact form submissions

## API Routes

- `GET/POST /api/contacts` - Handle contact form submissions

## Project Structure

```
marketing/
├── app/                 # App Router directory
│   ├── api/            # API routes
│   │   └── contacts/   # Contact API endpoints
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   └── ContactForm.tsx # Contact form component
├── lib/                # Utility libraries
│   └── prisma.ts       # Prisma client configuration
├── prisma/             # Database schema and migrations
│   └── schema.prisma   # Database schema
├── public/             # Static assets
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **ESLint** - Code linting

## Database Management

### Prisma Studio
To view and manage your database data:
```bash
npm run db:studio
```

### Migrations
To create and apply database migrations:
```bash
npm run db:migrate
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Prisma Documentation](https://www.prisma.io/docs) - learn about Prisma ORM.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
