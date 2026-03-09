# HS Blog 技术博客系统

基于 Vue3 + Node.js + MySQL 的全栈技术博客系统，包含前台展示和后台管理功能。

## 技术栈

### 前端
- Vue 3 (Composition API)
- Ant Design Vue 4.x
- Vue Router 4
- Pinia (状态管理)
- Axios (HTTP 请求)
- Vite (构建工具)
- Marked (Markdown 渲染)
- DOMPurify (XSS 防护)

### 后端
- Node.js
- Express (Web 框架)
- MySQL (数据库)
- JWT (身份认证)
- Multer (文件上传)
- Bcrypt (密码加密)

## 项目结构

```
hs-blog/
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   │   └── database.js # 数据库配置
│   │   ├── controllers/     # 控制器
│   │   │   ├── authController.js
│   │   │   ├── postController.js
│   │   │   ├── categoryController.js
│   │   │   └── commentController.js
│   │   ├── middleware/      # 中间件
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   │   ├── auth.js
│   │   │   ├── posts.js
│   │   │   ├── categories.js
│   │   │   └── comments.js
│   │   ├── utils/           # 工具函数
│   │   │   └── response.js
│   │   └── app.js           # 应用入口
│   ├── uploads/             # 上传文件目录
│   ├── package.json
│   └── .env.example
└── frontend/                # 前端项目
    ├── src/
    │   ├── api/             # API 接口
    │   │   ├── auth.js
    │   │   ├── post.js
    │   │   ├── category.js
    │   │   └── comment.js
    │   ├── assets/          # 静态资源
    │   ├── components/      # 公共组件
    │   ├── layouts/         # 布局组件
    │   │   ├── FrontLayout.vue
    │   │   ├── AdminLayout.vue
    │   │   └── BlankLayout.vue
    │   ├── router/          # 路由配置
    │   │   └── index.js
    │   ├── stores/          # 状态管理
    │   │   └── user.js
    │   ├── utils/           # 工具函数
    │   │   └── request.js
    │   ├── views/           # 页面组件
    │   │   ├── front/       # 前台页面
    │   │   │   ├── Home.vue
    │   │   │   ├── PostDetail.vue
    │   │   │   ├── Category.vue
    │   │   │   ├── Tag.vue
    │   │   │   └── About.vue
    │   │   └── admin/      # 后台页面
    │   │       ├── Login.vue
    │   │       ├── Dashboard.vue
    │   │       ├── PostList.vue
    │   │       ├── PostEdit.vue
    │   │       ├── CategoryList.vue
    │   │       ├── CommentList.vue
    │   │       └── Profile.vue
    │   ├── App.vue
    │   └── main.js
    ├── public/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm >= 8.0.0

### 1. 数据库配置

创建 MySQL 数据库：

```sql
CREATE DATABASE hs_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 后端配置

进入后端目录：

```bash
cd backend
```

安装依赖：

```bash
npm install
```

配置环境变量：

复制 `.env.example` 为 `.env` 并修改配置：

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hs_blog
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
```

启动后端服务：

```bash
npm run dev
```

后端服务将运行在 `http://localhost:3000`

首次启动会自动创建数据库表和默认管理员账号：
- 用户名：admin
- 密码：admin123

### 3. 前端配置

进入前端目录：

```bash
cd frontend
```

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

前端服务将运行在 `http://localhost:5173`

## 功能说明

### 前台功能

1. **首页**
   - 博客列表展示（分页、按时间排序）
   - 热门分类展示
   - 热门标签展示
   - 博主信息卡片

2. **博客详情页**
   - 博客内容展示（Markdown 渲染）
   - 点赞功能
   - 评论功能
   - 相关标签展示

3. **分类/标签页**
   - 按分类筛选博客
   - 按标签筛选博客

4. **关于页面**
   - 博主信息展示
   - 博客介绍

### 后台功能

1. **登录**
   - JWT 身份认证
   - 记住密码功能

2. **管理首页**
   - 数据统计（博客数、分类数、评论数、访问量）
   - 最近发布的博客

3. **博客管理**
   - 博客列表（筛选、分页）
   - 新增/编辑博客（支持 Markdown）
   - 删除博客
   - 发布/下架博客

4. **分类/标签管理**
   - 分类增删改查
   - 标签增删改查

5. **评论管理**
   - 评论列表
   - 审核评论
   - 删除评论

6. **个人中心**
   - 修改密码
   - 编辑个人资料
   - 上传头像

## 核心功能实现

### 1. JWT 身份认证

**后端实现** ([backend/src/middleware/auth.js](backend/src/middleware/auth.js))

```javascript
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ success: false, message: '未提供认证令牌' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: '无效的认证令牌' })
  }
}
```

**前端实现** ([frontend/src/utils/request.js](frontend/src/utils/request.js))

```javascript
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }
)
```

### 2. 博客 CRUD

**创建博客** ([backend/src/controllers/postController.js](backend/src/controllers/postController.js))

```javascript
const createPost = async (req, res) => {
  const { title, content, summary, categoryId, tags, status } = req.body
  const coverImage = req.file ? `/uploads/${req.file.filename}` : null
  
  const [result] = await pool.execute(
    'INSERT INTO posts (title, content, summary, cover_image, author_id, category_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, content, summary, coverImage, req.user.id, categoryId, status]
  )
  
  // 处理标签关联
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      // 创建或获取标签
      // 建立博客和标签的关联
    }
  }
}
```

### 3. Markdown 渲染

**前端实现** ([frontend/src/views/front/PostDetail.vue](frontend/src/views/front/PostDetail.vue))

```javascript
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  const html = marked(post.value.content)
  return DOMPurify.sanitize(html) // 防止 XSS 攻击
})
```

## 生产环境部署

### 后端部署

1. 使用 PM2 管理进程：

```bash
npm install -g pm2
pm2 start src/app.js --name hs-blog-backend
pm2 save
pm2 startup
```

2. 配置 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

### 前端部署

1. 构建生产版本：

```bash
npm run build
```

2. 将 `dist` 目录部署到静态服务器或使用 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

## 常见问题

### 1. 数据库连接失败

检查 `.env` 文件中的数据库配置是否正确，确保 MySQL 服务已启动。

### 2. 跨域问题

后端已配置 CORS，如果仍有问题，检查前端代理配置。

### 3. 文件上传失败

确保 `uploads` 目录存在且有写入权限。

## 开发规范

### 代码风格

- 前端使用 ESLint 进行代码检查
- 遵循 Vue 3 Composition API 最佳实践
- 使用语义化的组件和变量命名

### 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

## 许可证

MIT License

## 联系方式

如有问题，请联系：admin@example.com
