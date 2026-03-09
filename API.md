# HS Blog API 接口文档

## 基础信息

- Base URL: `http://localhost:3000/api`
- 认证方式: JWT Bearer Token
- 响应格式: JSON

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 失败响应

```json
{
  "success": false,
  "message": "错误信息"
}
```

## 认证接口

### 1. 用户注册

**接口地址:** `POST /auth/register`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名（3-50字符） |
| password | string | 是 | 密码（至少6个字符） |
| email | string | 否 | 邮箱 |

**响应示例:**

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser"
  }
}
```

### 2. 用户登录

**接口地址:** `POST /auth/login`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应示例:**

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "avatar": null,
      "bio": "博主"
    }
  }
}
```

### 3. 获取用户信息

**接口地址:** `GET /auth/profile`

**请求头:**

```
Authorization: Bearer {token}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "avatar": null,
    "bio": "博主",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. 更新用户信息

**接口地址:** `PUT /auth/profile`

**请求头:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 否 | 邮箱 |
| bio | string | 否 | 个人简介 |
| avatar | file | 否 | 头像图片 |

**响应示例:**

```json
{
  "success": true,
  "message": "更新成功"
}
```

### 5. 修改密码

**接口地址:** `PUT /auth/password`

**请求头:**

```
Authorization: Bearer {token}
```

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldPassword | string | 是 | 原密码 |
| newPassword | string | 是 | 新密码（至少6个字符） |

**响应示例:**

```json
{
  "success": true,
  "message": "密码修改成功"
}
```

## 博客接口

### 1. 获取博客列表

**接口地址:** `GET /posts`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |
| category | number | 否 | 分类ID |
| tag | number | 否 | 标签ID |
| status | string | 否 | 状态（draft/published） |
| keyword | string | 否 | 搜索关键词 |

**响应示例:**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "第一篇博客",
        "summary": "这是博客摘要",
        "content": "博客内容",
        "cover_image": "/uploads/image.jpg",
        "author_id": 1,
        "author_name": "admin",
        "category_id": 1,
        "category_name": "技术",
        "status": "published",
        "views": 100,
        "likes": 10,
        "tags": ["Vue", "Node.js"],
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 10,
      "total": 100
    }
  }
}
```

### 2. 获取博客详情

**接口地址:** `GET /posts/:id`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 博客ID |

**响应示例:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "第一篇博客",
    "summary": "这是博客摘要",
    "content": "博客内容",
    "cover_image": "/uploads/image.jpg",
    "author_id": 1,
    "author_name": "admin",
    "category_id": 1,
    "category_name": "技术",
    "status": "published",
    "views": 101,
    "likes": 10,
    "tags": ["Vue", "Node.js"],
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 创建博客

**接口地址:** `POST /posts`

**请求头:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 标题 |
| content | string | 是 | 内容（支持Markdown） |
| summary | string | 否 | 摘要 |
| categoryId | number | 否 | 分类ID |
| tags | string | 否 | 标签数组（JSON字符串） |
| status | string | 否 | 状态（draft/published），默认draft |
| coverImage | file | 否 | 封面图片 |

**响应示例:**

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 1
  }
}
```

### 4. 更新博客

**接口地址:** `PUT /posts/:id`

**请求头:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 博客ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 否 | 标题 |
| content | string | 否 | 内容（支持Markdown） |
| summary | string | 否 | 摘要 |
| categoryId | number | 否 | 分类ID |
| tags | string | 否 | 标签数组（JSON字符串） |
| status | string | 否 | 状态（draft/published） |
| coverImage | file | 否 | 封面图片 |

**响应示例:**

```json
{
  "success": true,
  "message": "更新成功"
}
```

### 5. 删除博客

**接口地址:** `DELETE /posts/:id`

**请求头:**

```
Authorization: Bearer {token}
```

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 博客ID |

**响应示例:**

```json
{
  "success": true,
  "message": "删除成功"
}
```

### 6. 点赞博客

**接口地址:** `POST /posts/:id/like`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 博客ID |

**响应示例:**

```json
{
  "success": true,
  "message": "点赞成功"
}
```

### 7. 获取统计数据

**接口地址:** `GET /posts/dashboard/stats`

**请求头:**

```
Authorization: Bearer {token}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "posts": 100,
      "categories": 10,
      "comments": 50,
      "views": 1000
    },
    "recentPosts": [
      {
        "id": 1,
        "title": "最新博客",
        "status": "published",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 分类接口

### 1. 获取分类列表

**接口地址:** `GET /categories`

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "技术",
      "description": "技术相关文章",
      "post_count": 50,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. 获取分类详情

**接口地址:** `GET /categories/:id`

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 分类ID |

**响应示例:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "技术",
    "description": "技术相关文章",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 创建分类

**接口地址:** `POST /categories`

**请求头:**

```
Authorization: Bearer {token}
```

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 分类名称 |
| description | string | 否 | 分类描述 |

**响应示例:**

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 1
  }
}
```

### 4. 更新分类

**接口地址:** `PUT /categories/:id`

**请求头:**

```
Authorization: Bearer {token}
```

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 分类ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 分类名称 |
| description | string | 否 | 分类描述 |

**响应示例:**

```json
{
  "success": true,
  "message": "更新成功"
}
```

### 5. 删除分类

**接口地址:** `DELETE /categories/:id`

**请求头:**

```
Authorization: Bearer {token}
```

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 分类ID |

**响应示例:**

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 标签接口

### 1. 获取标签列表

**接口地址:** `GET /tags`

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Vue",
      "post_count": 30,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. 创建标签

**接口地址:** `POST /tags`

**请求头:**

```
Authorization: Bearer {token}
```

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 标签名称 |

**响应示例:**

```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 1
  }
}
```

### 3. 删除标签

**接口地址:** `DELETE /tags/:id`

**请求头:**

```
Authorization: Bearer {token}
```

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 标签ID |

**响应示例:**

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 评论接口

### 1. 获取评论列表

**接口地址:** `GET /comments`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | number | 否 | 博客ID |
| status | string | 否 | 状态（pending/approved） |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认10 |

**响应示例:**

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 1,
        "post_id": 1,
        "user_id": 1,
        "username": "user1",
        "content": "评论内容",
        "parent_id": null,
        "status": "approved",
        "created_at": "2024-01-01T00:00:00.000Z",
        "post_title": "博客标题"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 10,
      "total": 50
    }
  }
}
```

### 2. 创建评论

**接口地址:** `POST /comments`

**请求参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| postId | number | 是 | 博客ID |
| content | string | 是 | 评论内容 |
| parentId | number | 否 | 父评论ID（回复评论时） |
| username | string | 条件 | 用户名（未登录时必填） |

**响应示例:**

```json
{
  "success": true,
  "message": "评论成功",
  "data": {
    "id": 1
  }
}
```

### 3. 审核评论

**接口地址:** `PUT /comments/:id/approve`

**请求头:**

```
Authorization: Bearer {token}
```

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 评论ID |

**响应示例:**

```json
{
  "success": true,
  "message": "审核通过"
}
```

### 4. 删除评论

**接口地址:** `DELETE /comments/:id`

**请求头:**

```
Authorization: Bearer {token}
```

**路径参数:**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 评论ID |

**响应示例:**

```json
{
  "success": true,
  "message": "删除成功"
}
```

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有需要认证的接口都需要在请求头中携带 JWT Token
2. Token 格式：`Bearer {token}`
3. 文件上传接口使用 `multipart/form-data` 格式
4. 分页参数从1开始
5. 时间格式统一使用 ISO 8601 格式
