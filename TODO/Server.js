const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'task_management',
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

app.post('/register', (req, res) => {
  const { nickname, password, firstName, lastName, patronymic } = req.body;

  const query = `SELECT * FROM users WHERE nickname = ?`;
  db.query(query, [nickname], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    if (result.length > 0) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const insertQuery = `INSERT INTO users (nickname, password, firstName, lastName, patronymic, role) VALUES (?, ?, ?, ?, ?, 'user')`;
    db.query(insertQuery, [nickname, hashedPassword, firstName, lastName, patronymic], (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Database error' });
        return;
      }

      res.json({ success: true, message: 'User registered successfully' });
    });
  });
});

app.get('/login', (req, res) => {
  const { nickname, password } = req.query;

  const query = `SELECT * FROM users WHERE nickname = ?`;
  db.query(query, [nickname], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    if (result.length === 0) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    const user = result[0];

    if (bcrypt.compareSync(password, user.password)) {
      res.json({
        success: true,
        message: 'Login successful',
        nickname: user.nickname,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        patronymic: user.patronymic,
      });
    } else {
      res.status(400).json({ error: 'Incorrect password' });
    }
  });
});

app.get('/users', (req, res) => {
  const query = `SELECT nickname, firstName, lastName, patronymic, role FROM users`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json({ success: true, users: results });
  });
});

app.post('/update-role', (req, res) => {
  const { nickname, role } = req.body;

  const query = `UPDATE users SET role = ? WHERE nickname = ?`;
  db.query(query, [role, nickname], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'Role updated successfully' });
  });
});

app.delete('/delete-user', (req, res) => {
  const { nickname } = req.body;

  const deleteQuery = `DELETE FROM users WHERE nickname = ?`;
  db.query(deleteQuery, [nickname], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'User deleted successfully' });
  });
});


app.post('/create-task', (req, res) => {
  const { title, description, dueDate, priority, status, createdBy, creatorRole, assignedTo } = req.body;

  console.log('Received data:', req.body);
  
  const insertQuery = `INSERT INTO tasks (title, description, dueDate, priority, status, createdBy, creatorRole, assignedTo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(insertQuery, [title, description, dueDate, priority, status, createdBy, creatorRole, assignedTo], (err, result) => {
    if (err) {
      console.error('Error creating task:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    res.json({ success: true, message: 'Task created successfully' });
  });
});




app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;

  const deleteQuery = `DELETE FROM tasks WHERE id = ?`;
  db.query(deleteQuery, [taskId], (err, result) => {
    if (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ success: false, error: 'Database error' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  });
});


app.get('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const query = `SELECT * FROM tasks WHERE id = ?`;
  db.query(query, [taskId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ success: true, task: result[0] });
  });
});

app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  const updateQuery = `UPDATE tasks SET status = ? WHERE id = ?`;
  db.query(updateQuery, [status, taskId], (err, result) => {
    if (err) {
      console.error('Error updating task status:', err);
      res.status(500).json({ success: false, error: 'Database error' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    res.json({ success: true, message: 'Task status updated successfully' });
  });
});




app.get('/tasks', (req, res) => {
  const query = `SELECT id, title, description, priority, createdBy, creatorRole, createdAt, dueDate, status, assignedTo FROM tasks`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json({ success: true, tasks: results });
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
