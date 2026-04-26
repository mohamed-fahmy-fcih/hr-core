# HR-Core: Employee Performance Evaluation System

HR-Core is a comprehensive platform designed for HR departments to manage employee performance, track skills, and analyze departmental progress through interactive data visualizations.

![HR-Core Dashboard Mockup](https://raw.githubusercontent.com/mohamed-fahmy-fcih/hr-core/main/frontend/public/dashboard-preview.png) *(Placeholder for preview)*

## 🚀 Key Features

### 📊 Performance Analytics
- **Dynamic Dashboards**: Real-time visualization of employee performance scores.
- **Department Comparisons**: Interactive bar charts (using Recharts) to compare performance metrics across different departments.
- **Weighted Scoring**: Automated performance calculation based on weighted skills and proficiency levels.

### 🛠 Administrative Tools
- **Department Management**: Create, update, and delete departments.
- **User Roles**: Specialized views for Administrators and Employees.
- **Skill Inventory**: Manage a master list of professional skills with custom weights.
- **User-to-Department Assignment**: Easily organize your workforce into functional units.

### 🔐 Security & Integration
- **JWT Authentication**: Secure login and session management.
- **Role-Based Access Control (RBAC)**: Ensure users only see what they are authorized to access.
- **Prisma ORM**: Robust database management and migrations.

## 💻 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### 1. Clone the repository
```bash
git clone https://github.com/mohamed-fahmy-fcih/hr-core.git
cd hr-core
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hr_core"
JWT_SECRET="your_secret_key"
PORT=5000
```
- Run migrations and seed data:
```bash
npx prisma migrate dev
node seed.js
```
- Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
- Access the application at `http://localhost:5173`.

## 📜 License
This project is licensed under the MIT License.

---
Built with ❤️ by [Mohamed Fahmy](https://github.com/mohamed-fahmy-fcih)
