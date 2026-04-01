import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("hr_admin.db");

// Helper to add column if not exists
function addColumnIfNotExists(tableName: string, columnName: string, columnType: string) {
  const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
  const columnExists = tableInfo.some(col => col.name === columnName);
  if (!columnExists) {
    try {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
      console.log(`Added column ${columnName} to ${tableName}`);
    } catch (err) {
      console.error(`Error adding column ${columnName}:`, err);
    }
  }
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    dob TEXT,
    address TEXT,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT DEFAULT '1',
    cccd_number TEXT,
    cccd_issue_date TEXT,
    id_issue_place TEXT,
    cccd_front_image TEXT,
    cccd_back_image TEXT,
    contract_number TEXT,
    contract_sign_date TEXT,
    contract_start_date TEXT,
    contract_end_date TEXT,
    contract_type TEXT,
    role TEXT NOT NULL DEFAULT 'staff',
    department TEXT NOT NULL,
    job_title TEXT NOT NULL,
    manager_id INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    join_date TEXT NOT NULL,
    net_salary REAL NOT NULL,
    salary_effective_date TEXT,
    salary_notes TEXT,
    annual_leave_balance INTEGER DEFAULT 12,
    notes TEXT,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS payslips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    basic_salary REAL,
    bonuses REAL DEFAULT 0,
    deductions REAL DEFAULT 0,
    net_salary REAL,
    generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS performance_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    year INTEGER NOT NULL,
    score INTEGER,
    notes TEXT,
    FOREIGN KEY(employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    type TEXT DEFAULT 'annual',
    status TEXT DEFAULT 'approved',
    reason TEXT,
    FOREIGN KEY(employee_id) REFERENCES employees(id)
  );
`);

// Ensure all columns exist (for existing databases)
addColumnIfNotExists('employees', 'full_name', 'TEXT NOT NULL DEFAULT ""');
addColumnIfNotExists('employees', 'dob', 'TEXT');
addColumnIfNotExists('employees', 'address', 'TEXT');
addColumnIfNotExists('employees', 'cccd_number', 'TEXT');
addColumnIfNotExists('employees', 'cccd_issue_date', 'TEXT');
addColumnIfNotExists('employees', 'id_issue_place', 'TEXT');
addColumnIfNotExists('employees', 'cccd_front_image', 'TEXT');
addColumnIfNotExists('employees', 'cccd_back_image', 'TEXT');
addColumnIfNotExists('employees', 'contract_sign_date', 'TEXT');
addColumnIfNotExists('employees', 'job_title', 'TEXT NOT NULL DEFAULT ""');
addColumnIfNotExists('employees', 'annual_leave_balance', 'INTEGER DEFAULT 12');
addColumnIfNotExists('employees', 'net_salary', 'REAL NOT NULL DEFAULT 0');
addColumnIfNotExists('employees', 'password', 'TEXT DEFAULT "1"');
addColumnIfNotExists('employees', 'avatar', 'TEXT');

// Seed initial data if empty
const employeeCount = db.prepare("SELECT COUNT(*) as count FROM employees").get() as { count: number };
if (employeeCount.count === 0) {
  const insert = db.prepare("INSERT INTO employees (full_name, email, role, department, job_title, join_date, net_salary, status, annual_leave_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insert.run("Admin User", "admin@tlconceptsltd.com", "admin", "Management", "Director", "2023-01-01", 50000000, "active", 12);
  insert.run("Nguyen Van A", "vana@tlconceptsltd.com", "staff", "Interior Design", "Senior Designer", "2023-03-15", 25000000, "active", 12);
  insert.run("Tran Thi B", "thib@tlconceptsltd.com", "staff", "Exterior-Architecture", "Architect", "2023-06-01", 22000000, "active", 12);
  insert.run("Le Van C", "vanc@tlconceptsltd.com", "staff", "Photo-Video Editing", "Editor", "2024-01-10", 18000000, "active", 12);

  // Seed leaves
  const leaveCount = db.prepare("SELECT COUNT(*) as count FROM leaves").get() as { count: number };
  if (leaveCount.count === 0) {
    const insertLeave = db.prepare("INSERT INTO leaves (employee_id, start_date, end_date, reason) VALUES (?, ?, ?, ?)");
    insertLeave.run(2, "2026-03-10", "2026-03-12", "Family vacation");
    insertLeave.run(3, "2026-04-05", "2026-04-05", "Personal appointment");
    insertLeave.run(2, "2026-05-20", "2026-05-25", "Summer break");
  }
}

// Migrate existing emails to new domain
try {
  db.prepare("UPDATE employees SET email = replace(email, '@tlconcepts.com', '@tlconceptsltd.com')").run();
} catch (e) {
  console.error("Failed to migrate emails", e);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM employees WHERE email = ?").get(email) as any;
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/employees", (req, res) => {
    const employees = db.prepare(`
      SELECT 
        id, full_name, dob, address, phone, email, cccd_number, cccd_issue_date, id_issue_place,
        cccd_front_image, cccd_back_image, contract_number, contract_sign_date, 
        contract_start_date, contract_end_date, contract_type, role, department, 
        job_title, manager_id, status, join_date, net_salary, salary_effective_date, 
        salary_notes, annual_leave_balance, notes, avatar
      FROM employees
    `).all();
    res.json(employees);
  });

  app.post("/api/employees", (req, res) => {
    const { 
      full_name, dob, address, phone, email, password, cccd_number, cccd_issue_date, id_issue_place,
      cccd_front_image, cccd_back_image,
      contract_number, contract_sign_date, contract_start_date, contract_end_date, contract_type,
      role, department, job_title, manager_id, status, join_date, net_salary,
      salary_effective_date, salary_notes, annual_leave_balance, notes, avatar
    } = req.body;
    
    try {
      const insert = db.prepare(`
        INSERT INTO employees (
          full_name, dob, address, phone, email, password, cccd_number, cccd_issue_date, id_issue_place,
          cccd_front_image, cccd_back_image,
          contract_number, contract_sign_date, contract_start_date, contract_end_date, contract_type,
          role, department, job_title, manager_id, status, join_date, net_salary,
          salary_effective_date, salary_notes, annual_leave_balance, notes, avatar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insert.run(
        full_name, dob, address, phone, email, password || '1', cccd_number, cccd_issue_date, id_issue_place,
        cccd_front_image, cccd_back_image,
        contract_number, contract_sign_date, contract_start_date, contract_end_date, contract_type,
        role || 'staff', department, job_title, manager_id ?? null, status || 'active', join_date, net_salary,
        salary_effective_date, salary_notes, annual_leave_balance || 12, notes, avatar
      );
      
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/employees/:id", (req, res) => {
    const { 
      full_name, dob, address, phone, email, cccd_number, cccd_issue_date, id_issue_place,
      cccd_front_image, cccd_back_image,
      contract_number, contract_sign_date, contract_start_date, contract_end_date, contract_type,
      role, department, job_title, manager_id, status, join_date, net_salary,
      salary_effective_date, salary_notes, annual_leave_balance, notes, avatar
    } = req.body;
    const { id } = req.params;
    
    try {
      db.prepare(`
        UPDATE employees SET 
          full_name = ?, dob = ?, address = ?, phone = ?, email = ?, cccd_number = ?, 
          cccd_issue_date = ?, id_issue_place = ?, cccd_front_image = ?, cccd_back_image = ?,
          contract_number = ?, contract_sign_date = ?, 
          contract_start_date = ?, contract_end_date = ?, contract_type = ?, role = ?, 
          department = ?, job_title = ?, manager_id = ?, status = ?, join_date = ?, 
          net_salary = ?, salary_effective_date = ?, salary_notes = ?, 
          annual_leave_balance = ?, notes = ?, avatar = ?
        WHERE id = ?
      `).run(
        full_name, dob, address, phone, email, cccd_number, cccd_issue_date, id_issue_place,
        cccd_front_image, cccd_back_image,
        contract_number, contract_sign_date, contract_start_date, contract_end_date, contract_type,
        role, department, job_title, manager_id ?? null, status, join_date, net_salary,
        salary_effective_date, salary_notes, annual_leave_balance, notes, avatar, id
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/employees/:id/password", (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    try {
      const employee = db.prepare("SELECT password FROM employees WHERE id = ?").get(id) as any;
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (employee.password !== currentPassword) {
        return res.status(401).json({ error: "Incorrect current password" });
      }

      db.prepare("UPDATE employees SET password = ? WHERE id = ?").run(newPassword, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/employees/:id", (req, res) => {
    const { id } = req.params;
    try {
      // Delete related records first to maintain referential integrity
      db.prepare("DELETE FROM payslips WHERE employee_id = ?").run(id);
      db.prepare("DELETE FROM performance_reports WHERE employee_id = ?").run(id);
      db.prepare("DELETE FROM leaves WHERE employee_id = ?").run(id);
      
      const result = db.prepare("DELETE FROM employees WHERE id = ?").run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/payslips", (req, res) => {
    const payslips = db.prepare(`
      SELECT p.*, e.full_name as employee_name 
      FROM payslips p 
      JOIN employees e ON p.employee_id = e.id
      ORDER BY p.year DESC, p.month DESC
    `).all();
    res.json(payslips);
  });

  app.post("/api/payslips", (req, res) => {
    const { employee_id, month, year, basic_salary, bonuses, deductions } = req.body;
    const net_salary = Number(basic_salary) + Number(bonuses) - Number(deductions);
    const info = db.prepare("INSERT INTO payslips (employee_id, month, year, basic_salary, bonuses, deductions, net_salary) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(employee_id, month, year, basic_salary, bonuses, deductions, net_salary);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/reports/performance", (req, res) => {
    const reports = db.prepare(`
      SELECT r.*, e.full_name as employee_name 
      FROM performance_reports r 
      JOIN employees e ON r.employee_id = e.id
    `).all();
    res.json(reports);
  });

  app.get("/api/leaves", (req, res) => {
    const leaves = db.prepare(`
      SELECT l.*, e.full_name as employee_name 
      FROM leaves l 
      JOIN employees e ON l.employee_id = e.id
    `).all();
    res.json(leaves);
  });

  app.post("/api/leaves", (req, res) => {
    const { employee_id, start_date, end_date, reason, type } = req.body;
    const info = db.prepare("INSERT INTO leaves (employee_id, start_date, end_date, reason, type) VALUES (?, ?, ?, ?, ?)")
      .run(employee_id, start_date, end_date, reason, type || 'annual');
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/stats", (req, res) => {
    const totalEmployees = db.prepare("SELECT COUNT(*) as count FROM employees").get() as any;
    const totalSalary = db.prepare("SELECT SUM(net_salary) as total FROM employees WHERE status = 'active'").get() as any;
    const deptDistribution = db.prepare("SELECT department, COUNT(*) as count FROM employees GROUP BY department").all();
    res.json({
      totalEmployees: totalEmployees.count,
      totalSalary: totalSalary.total,
      deptDistribution
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
