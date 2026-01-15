const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();

// Use /tmp for database in serverless environment (Vercel)
const dbPath = process.env.VERCEL ? '/tmp/database.db' : 'database.db';
const db = new Database(dbPath);
const PORT = process.env.PORT || 3000;

// Auto-seed database if tables don't exist
function seedDatabase() {
    try {
        // Check if users table exists
        const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();

        if (!tableExists) {
            console.log('📦 Seeding database...');

            // Create tables
            db.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          fullname TEXT NOT NULL
        );

        CREATE TABLE attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL,
          marked_by INTEGER NOT NULL,
          FOREIGN KEY (student_id) REFERENCES users(id),
          FOREIGN KEY (marked_by) REFERENCES users(id)
        );

        CREATE TABLE marks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          marks INTEGER NOT NULL,
          marked_by INTEGER NOT NULL,
          date TEXT NOT NULL,
          FOREIGN KEY (student_id) REFERENCES users(id),
          FOREIGN KEY (marked_by) REFERENCES users(id)
        );

        CREATE TABLE assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          due_date TEXT NOT NULL,
          status TEXT NOT NULL,
          FOREIGN KEY (student_id) REFERENCES users(id)
        );
      `);

            // Insert users
            const insertUser = db.prepare('INSERT INTO users (email, password, role, fullname) VALUES (?, ?, ?, ?)');
            insertUser.run('admin@school.com', 'admin123', 'admin', 'Admin User');
            insertUser.run('teacher@school.com', 'teach123', 'faculty', 'Professor Smith');
            insertUser.run('student@school.com', 'student123', 'student', 'John Doe');

            // Get user IDs
            const student = db.prepare('SELECT id FROM users WHERE role = ?').get('student');
            const faculty = db.prepare('SELECT id FROM users WHERE role = ?').get('faculty');

            // Insert sample attendance (last 7 days)
            const insertAttendance = db.prepare('INSERT INTO attendance (student_id, date, status, marked_by) VALUES (?, ?, ?, ?)');
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const status = i % 3 === 0 ? 'absent' : 'present';
                insertAttendance.run(student.id, dateStr, status, faculty.id);
            }

            // Insert sample marks
            const insertMarks = db.prepare('INSERT INTO marks (student_id, subject, marks, marked_by, date) VALUES (?, ?, ?, ?, ?)');
            insertMarks.run(student.id, 'Mathematics', 85, faculty.id, '2026-01-10');
            insertMarks.run(student.id, 'Physics', 78, faculty.id, '2026-01-11');
            insertMarks.run(student.id, 'Chemistry', 92, faculty.id, '2026-01-12');
            insertMarks.run(student.id, 'English', 88, faculty.id, '2026-01-13');

            // Insert sample assignments
            const insertAssignment = db.prepare('INSERT INTO assignments (student_id, title, due_date, status) VALUES (?, ?, ?, ?)');
            insertAssignment.run(student.id, 'Math Assignment - Calculus Problems', '2026-01-20', 'submitted');
            insertAssignment.run(student.id, 'Physics Lab Report - Pendulum Experiment', '2026-01-22', 'pending');
            insertAssignment.run(student.id, 'Chemistry Essay - Organic Compounds', '2026-01-25', 'pending');

            console.log('✅ Database seeded successfully!');
        }
    } catch (error) {
        console.error('❌ Seeding error:', error);
    }
}

// Seed database on startup
seedDatabase();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'student-portal-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Authentication Middleware
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (req.session.user && roles.includes(req.session.user.role)) {
            next();
        } else {
            res.status(403).send('Access Denied');
        }
    };
}

// Routes

// Home - Redirect based on auth status
app.get('/', (req, res) => {
    if (req.session.user) {
        const role = req.session.user.role;
        res.redirect(`/${role}`);
    } else {
        res.redirect('/login');
    }
});

// Login Page
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { error: null });
});

// Login Handler
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);

    if (user) {
        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullname: user.fullname
        };
        res.redirect(`/${user.role}`);
    } else {
        res.render('login', { error: 'Invalid email or password' });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Student Dashboard
app.get('/student', requireAuth, requireRole('student'), (req, res) => {
    const userId = req.session.user.id;

    // Get attendance records
    const attendanceRecords = db.prepare(`
    SELECT date, status 
    FROM attendance 
    WHERE student_id = ? 
    ORDER BY date DESC 
    LIMIT 7
  `).all(userId);

    // Calculate attendance percentage
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Get marks
    const marks = db.prepare(`
    SELECT subject, marks, date 
    FROM marks 
    WHERE student_id = ? 
    ORDER BY date DESC
  `).all(userId);

    // Get assignments
    const assignments = db.prepare(`
    SELECT title, due_date, status 
    FROM assignments 
    WHERE student_id = ? 
    ORDER BY due_date
  `).all(userId);

    res.render('student', {
        user: req.session.user,
        attendanceRecords,
        attendancePercentage,
        presentDays,
        totalDays,
        marks,
        assignments
    });
});

// Faculty Dashboard
app.get('/faculty', requireAuth, requireRole('faculty'), (req, res) => {
    const students = db.prepare(`
    SELECT id, fullname, email 
    FROM users 
    WHERE role = 'student'
  `).all();

    // Get recent attendance for today
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = db.prepare(`
    SELECT student_id, status 
    FROM attendance 
    WHERE date = ?
  `).all(today);

    const attendanceMap = {};
    todayAttendance.forEach(a => {
        attendanceMap[a.student_id] = a.status;
    });

    res.render('faculty', {
        user: req.session.user,
        students,
        attendanceMap,
        today
    });
});

// Admin Dashboard
app.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
    const allUsers = db.prepare('SELECT id, fullname, email, role FROM users').all();

    const stats = {
        totalUsers: allUsers.length,
        totalStudents: allUsers.filter(u => u.role === 'student').length,
        totalFaculty: allUsers.filter(u => u.role === 'faculty').length
    };

    res.render('admin', {
        user: req.session.user,
        users: allUsers,
        stats
    });
});

// API: Mark Attendance
app.post('/api/mark-attendance', requireAuth, requireRole('faculty'), (req, res) => {
    const { student_id, status } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const facultyId = req.session.user.id;

    // Check if attendance already exists for today
    const existing = db.prepare(`
    SELECT id 
    FROM attendance 
    WHERE student_id = ? AND date = ?
  `).get(student_id, today);

    if (existing) {
        // Update existing
        db.prepare(`
      UPDATE attendance 
      SET status = ?, marked_by = ? 
      WHERE student_id = ? AND date = ?
    `).run(status, facultyId, student_id, today);
    } else {
        // Insert new
        db.prepare(`
      INSERT INTO attendance (student_id, date, status, marked_by) 
      VALUES (?, ?, ?, ?)
    `).run(student_id, today, status, facultyId);
    }

    res.json({ success: true, message: 'Attendance marked successfully' });
});

// API: Submit Marks
app.post('/api/submit-marks', requireAuth, requireRole('faculty'), (req, res) => {
    const { student_id, subject, marks } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const facultyId = req.session.user.id;

    db.prepare(`
    INSERT INTO marks (student_id, subject, marks, marked_by, date) 
    VALUES (?, ?, ?, ?, ?)
  `).run(student_id, subject, marks, facultyId, today);

    res.json({ success: true, message: 'Marks submitted successfully' });
});

// API: Add User (Admin only)
app.post('/api/add-user', requireAuth, requireRole('admin'), (req, res) => {
    const { email, password, role, fullname } = req.body;

    try {
        db.prepare(`
      INSERT INTO users (email, password, role, fullname) 
      VALUES (?, ?, ?, ?)
    `).run(email, password, role, fullname);

        res.json({ success: true, message: 'User added successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Email already exists' });
    }
});

// API: Delete User (Admin only)
app.post('/api/delete-user', requireAuth, requireRole('admin'), (req, res) => {
    const { user_id } = req.body;

    // Prevent admin from deleting themselves
    if (user_id == req.session.user.id) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(user_id);
    res.json({ success: true, message: 'User deleted successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Student Portal running on http://localhost:${PORT}`);
    console.log(`📚 Use these credentials to login:`);
    console.log(`   Admin:   admin@school.com / admin123`);
    console.log(`   Faculty: teacher@school.com / teach123`);
    console.log(`   Student: student@school.com / student123`);
});
