const Database = require('better-sqlite3');
const db = new Database('database.db');

console.log('🌱 Seeding database...');

// Create tables
db.exec(`
  DROP TABLE IF EXISTS assignments;
  DROP TABLE IF EXISTS marks;
  DROP TABLE IF EXISTS attendance;
  DROP TABLE IF EXISTS users;

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

console.log('✅ Tables created');

// Insert hardcoded users
const insertUser = db.prepare('INSERT INTO users (email, password, role, fullname) VALUES (?, ?, ?, ?)');

insertUser.run('admin@school.com', 'admin123', 'admin', 'Admin User');
insertUser.run('teacher@school.com', 'teach123', 'faculty', 'Professor Smith');
insertUser.run('student@school.com', 'student123', 'student', 'John Doe');

console.log('✅ Users seeded (admin, faculty, student)');

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
  const status = i % 3 === 0 ? 'absent' : 'present'; // Simulate some absences
  insertAttendance.run(student.id, dateStr, status, faculty.id);
}

console.log('✅ Attendance records seeded');

// Insert sample marks
const insertMarks = db.prepare('INSERT INTO marks (student_id, subject, marks, marked_by, date) VALUES (?, ?, ?, ?, ?)');

insertMarks.run(student.id, 'Mathematics', 85, faculty.id, '2026-01-10');
insertMarks.run(student.id, 'Physics', 78, faculty.id, '2026-01-11');
insertMarks.run(student.id, 'Chemistry', 92, faculty.id, '2026-01-12');
insertMarks.run(student.id, 'English', 88, faculty.id, '2026-01-13');

console.log('✅ Marks seeded');

// Insert sample assignments
const insertAssignment = db.prepare('INSERT INTO assignments (student_id, title, due_date, status) VALUES (?, ?, ?, ?)');

insertAssignment.run(student.id, 'Math Assignment - Calculus Problems', '2026-01-20', 'submitted');
insertAssignment.run(student.id, 'Physics Lab Report - Pendulum Experiment', '2026-01-22', 'pending');
insertAssignment.run(student.id, 'Chemistry Essay - Organic Compounds', '2026-01-25', 'pending');

console.log('✅ Assignments seeded');

db.close();

console.log('\n🎉 Database seeding complete!');
console.log('\n📋 Test Credentials:');
console.log('   Admin:   admin@school.com / admin123');
console.log('   Faculty: teacher@school.com / teach123');
console.log('   Student: student@school.com / student123\n');
