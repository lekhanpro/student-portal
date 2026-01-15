# Student Portal - Complete Guide

A fully functional, role-based Student Portal web application with Admin, Faculty, and Student dashboards.

## 🚀 Features

- **Role-Based Authentication**: Separate dashboards for Admin, Faculty, and Student
- **Attendance System**: Faculty can mark attendance, students can view their attendance percentage with charts
- **Marks Management**: Faculty can submit marks, students can view their results
- **Assignment Tracking**: Students can see pending and submitted assignments
- **User Management**: Admin can add/remove users
- **Responsive Design**: Beautiful Bootstrap UI that works on all devices

## 📋 Pre-set User Credentials

No registration needed! Use these credentials to login:

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@school.com       | admin123   |
| Faculty | teacher@school.com     | teach123   |
| Student | student@school.com     | student123 |

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: SQLite (with better-sqlite3)
- **Template Engine**: EJS
- **Frontend**: Bootstrap 5, Chart.js
- **Session Management**: Express-session

## 📁 Project Structure

```
student-portal/
├── server.js              # Main Express application
├── seed.js               # Database seeding script
├── package.json          # Dependencies
├── vercel.json           # Vercel deployment config
├── database.db           # SQLite database (auto-generated)
├── public/
│   ├── css/
│   │   └── style.css    # Custom styles
│   └── js/
│       └── charts.js    # Chart.js & AJAX functions
└── views/
    ├── partials/
    │   └── navbar.ejs   # Reusable navbar
    ├── login.ejs        # Login page
    ├── student.ejs      # Student dashboard
    ├── faculty.ejs      # Faculty dashboard
    └── admin.ejs        # Admin dashboard
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Seed the Database

```bash
npm run seed
```

This will create:
- 3 users (admin, faculty, student)
- Sample attendance records (last 7 days)
- Sample marks data
- Mock assignments

### 3. Start the Server

```bash
npm start
```

The server will run on **http://localhost:3000**

### 4. Login and Explore

Visit http://localhost:3000 and login with any of the pre-set credentials above.

## 🌐 Vercel Deployment

### Deploy to Vercel (One Command)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow the prompts)
vercel
```

The application is Vercel-ready with the included `vercel.json` configuration!

## 📱 Role-Specific Features

### 👨‍💼 Admin Dashboard
- View system statistics (total users, students, faculty)
- User management (add/delete users)
- System information

### 👨‍🏫 Faculty Dashboard
- Mark attendance for students (Present/Absent toggle)
- Submit marks for different subjects
- View student list
- Quick statistics

### 🎓 Student Dashboard
- View attendance percentage with bar chart
- See recent marks and grades
- Track assignment status (Pending/Submitted)
- Access academic materials (PDF downloads)
- View upcoming exams

## 🗄️ Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `password`: Plain text (for demo purposes)
- `role`: admin | faculty | student
- `fullname`: User's full name

### Attendance Table
- `id`: Primary key
- `student_id`: Foreign key to users
- `date`: Attendance date
- `status`: present | absent
- `marked_by`: Faculty who marked

### Marks Table
- `id`: Primary key
- `student_id`: Foreign key to users
- `subject`: Subject name
- `marks`: Score out of 100
- `marked_by`: Faculty who submitted
- `date`: Submission date

### Assignments Table
- `id`: Primary key
- `student_id`: Foreign key to users
- `title`: Assignment title
- `due_date`: Deadline
- `status`: pending | submitted

## 🔧 API Endpoints

| Method | Endpoint              | Role Required | Description                |
|--------|----------------------|---------------|----------------------------|
| GET    | /                    | All           | Redirects to role dashboard |
| GET    | /login               | None          | Login page                 |
| POST   | /login               | None          | Authenticate user          |
| GET    | /logout              | All           | Destroy session            |
| GET    | /student             | Student       | Student dashboard          |
| GET    | /faculty             | Faculty       | Faculty dashboard          |
| GET    | /admin               | Admin         | Admin dashboard            |
| POST   | /api/mark-attendance | Faculty       | Mark student attendance    |
| POST   | /api/submit-marks    | Faculty       | Submit student marks       |
| POST   | /api/add-user        | Admin         | Add new user               |
| POST   | /api/delete-user     | Admin         | Delete existing user       |

## 🎨 Custom Styling

The application uses a modern color scheme:
- Primary: `#4F46E5` (Indigo)
- Success: `#10B981` (Green)
- Danger: `#EF4444` (Red)
- Info: `#3B82F6` (Blue)

All cards have hover effects, smooth animations, and responsive design.

## 📊 Charts & Visualizations

- **Attendance Chart**: Bar chart showing present vs absent days (using Chart.js)
- **Progress Bar**: Visual attendance percentage indicator
- **Stats Cards**: Color-coded statistics with icons

## 🔒 Security Notes

> **⚠️ IMPORTANT**: This is a demonstration/educational project. In production, you should:
> - Hash passwords using bcrypt
> - Use environment variables for secrets
> - Implement HTTPS
> - Add CSRF protection
> - Validate and sanitize all user inputs
> - Use prepared statements (already implemented with better-sqlite3)

## 📝 Development

### Running in Development Mode

```bash
npm run dev
```

### Re-seeding the Database

If you want to reset the database:

```bash
# Delete the database file
rm database.db  # On Windows: del database.db

# Re-seed
npm run seed
```

## 🐛 Troubleshooting

**Issue**: Database not found
- **Solution**: Run `npm run seed` first

**Issue**: Port 3000 already in use
- **Solution**: Set custom port: `PORT=3001 npm start`

**Issue**: Cannot find module 'better-sqlite3'
- **Solution**: Run `npm install` to install all dependencies

## 📄 License

MIT License - Free to use for educational purposes

## 👨‍💻 Author

Created as a comprehensive Student Portal demonstration project.

---

**Enjoy your Student Portal! 🎓**
