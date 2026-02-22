# Next.js Dashboard with Supabase

A full-stack financial dashboard application built with Next.js (App Router), React, and Tailwind CSS. This project features user authentication, a PostgreSQL database, and server-side data mutations powered by Supabase and Next.js Server Actions.

## Features

* **Authentication:** Secure user sign-up, log-in, and session management using Supabase Auth.
* **Database Management:** Fully integrated PostgreSQL database to manage users, customers, and invoices.
* **Server Actions:** Secure, server-side data mutations for creating, updating, and deleting invoices without client-side API routes.
* **Form Validation:** Robust schema validation using Zod.
* **Responsive Design:** A mobile-friendly, beautiful user interface built with Tailwind CSS.
* **Streaming & Suspense:** Fast loading states and optimized data fetching using React Suspense and Next.js Server Components.

## Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Validation:** [Zod](https://zod.dev/)
* **Icons:** [Heroicons](https://heroicons.com/)
* **Fonts:** [next/font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) (Inter & Lusitana)

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd nextjs-dashboard