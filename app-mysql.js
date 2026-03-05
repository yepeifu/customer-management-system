const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const cors = require('cors')

app.use(cors())
// const port = 3000;
const port = process.env.PORT || 3000;  // Railway 会传 PORT 环境变量

app.use(express.json());

// 数据库连接配置
const dbConfig = {
    host: process.env.MYSQLHOST || "localhost",
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "1234root",
    database: process.env.MYSQLDATABASE || "my_customer_db",
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}
// 创建连接池
const pool = mysql.createPool(dbConfig)

// ================== 添加这段：自动建表 ==================
async function initDatabase() {
    try {
        // 创建表（如果不存在）
        await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
        console.log('✅ 数据库表检查/创建成功');

        // 检查是否有数据，没有则插入测试数据
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
        if (rows[0].count === 0) {
            await pool.query(`INSERT INTO users (name, phone) VALUES 
          ('张三', '13800138000'),
          ('李四', '13900139000')
        `);
            console.log('✅ 测试数据插入成功');
        }
    } catch (err) {
        console.error('❌ 数据库初始化失败：', err.message);
    }
}

// 启动时执行初始化
initDatabase();
// 接口1 查询所有用户
app.get('/api/user/list', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        res.json({
            code: 200,
            data: rows,
            msg: "查询成功了"
        })
    } catch (err) {
        res.json({
            code: 500,
            msg: "查询失败" + err.message
        })
    }
})
// 接口2 添加用户
app.post("/api/user/add", async (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
        return res.json({ code: 400, msg: "姓名和电话不能为空" })
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO users (name, phone) VALUES (?,?)',
            [name, phone]
        )
        res.json({
            code: 200,
            data: {
                id: result.insertId,
                name,
                phone
            },
            msg: "添加成功"
        })

    } catch (err) {
        res.json({ code: 500, msg: "添加失败" + err.message })
    }
})
// 接口3 删除客户
app.delete("/api/user/delete/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query("DELETE FROM users WHERE id = ?", [id]);
        res.json({
            code: 200,
            msg: "删除成功"
        })
    } catch (err) {
        res.json({
            code: 500,
            msg: "删除失败，" + err.message
        })
    }
})
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log('已连接 MySQL 数据库：my_customer_db');
})