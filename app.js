const express = require('express');
const app = express();
const post = 3000;
// 服务器解析JSON格式数据
app.use(express.json());
// 假数据 先不用数据库，用数组
let users = [
    { id: 1, name: '张三', phone: 20 },
    { id: 2, name: '李四', phone: 21 },
    { id: 3, name: '王五', phone: 22 },
];
// 接口1查询所有用户（GET）
app.get('/api/user/list', (req, res) => {
    res.json({
        code: 200,
        user: users,
        msg: '查询成功'
    })
})
// 添加用户（post）
app.post('/api/user/add', (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
        return res.json({
            code: 400,
            mas: '姓名和电话不能为空'
        })
    }
    const newUser = {
        id: users.length + 1,
        name,
        phone
    }
    users.push(newUser);
    res.json({
        code: 200,
        user: newUser,
        msg: '添加成功'
    })
})
// 删除用户（delete）
app.delete('/api/user/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
        return res.json({
            code: 400,
            msg: '用户不存在'
        })
    }
    users.splice(index, 1);
    res.json({
        code: 200,
        msg: '删除成功'
    })
})
// 修改用户（put）
app.put('/api/user/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body;
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
        return res.json({ code: 400, msg: '用户不存在' })
    }
    users[index] = {
        id,
        name,
        phone
    }
    res.json({
        code: 200,
        msg: '修改成功'
    })
})
// 测试根路径
app.get('/', (req, res) => {
    res.send('day2完成，api服务运行中')
})
// 启动服务器
app.listen(post, () => {
    console.log(`服务器运行在 http://localhost:${post}`)
    console.log('测试接口:')
    console.log('GET, http://localhost:3000/api/user/list, 查询所有用户')
    console.log('POST, http://localhost:3000/api/user/add, 添加用户')
})  