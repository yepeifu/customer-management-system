const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 数据库配置（从环境变量读取）
const dbConfig = {
  host: process.env.MYSQLHOST,           // Railway 会自动提供
  user: process.env.MYSQLUSER,           // Railway 会自动提供
  password: process.env.MYSQLPASSWORD,   // Railway 会自动提供
  database: process.env.MYSQLDATABASE,   // Railway 会自动提供
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);

// 自动建表函数
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // 插入测试数据（如果表空）
    const [rows] = await pool.query('SELECT COUNT(*) as c FROM users');
    if (rows[0].c === 0) {
      await pool.query(`INSERT INTO users (name, phone) VALUES 
        ('张三', '13800138000'), ('李四', '13900139000')`);
    }
    console.log('✅ 数据库初始化完成');
  } catch (err) {
    console.error('❌ 数据库错误:', err.message);
  }
}

// 初始化
initDB();

// API 路由
app.get('/api/user/list', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users');
  res.json({ code: 200, data: rows });
});

app.post('/api/user/add', async (req, res) => {
  const { name, phone } = req.body;
  const [result] = await pool.query('INSERT INTO users (name, phone) VALUES (?,?)', [name, phone]);
  res.json({ code: 200, data: { id: result.insertId } });
});

app.delete('/api/user/delete/:id', async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ code: 200, msg: '删除成功' });
});

// 托管前端
app.use(express.static('public'));

app.listen(port, () => console.log(`运行在端口 ${port}`));