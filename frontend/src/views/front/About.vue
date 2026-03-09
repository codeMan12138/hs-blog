<template>
  <div class="about-container">
    <a-card class="about-card">
      <h1>关于我</h1>
      <div class="about-content">
        <div class="author-avatar">
          <a-avatar :size="120" src="https://via.placeholder.com/120" />
        </div>
        <div class="author-info">
          <h2>博主</h2>
          <p class="bio">热爱技术，分享知识</p>
          <div class="contact-info">
            <p><MailOutlined /> admin@example.com</p>
            <p><GithubOutlined /> github.com/username</p>
          </div>
        </div>
      </div>
      
      <a-divider />
      
      <div class="about-text">
        <h3>关于本博客</h3>
        <p>这是一个基于 Vue3 + Node.js + MySQL 技术栈构建的个人技术博客。</p>
        <p>主要技术栈：</p>
        <ul>
          <li>前端：Vue3 + Ant Design Vue + Vite</li>
          <li>后端：Node.js + Express</li>
          <li>数据库：MySQL</li>
          <li>认证：JWT</li>
        </ul>
        <p>本博客支持文章发布、分类标签管理、评论互动等功能。</p>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { MailOutlined, GithubOutlined } from '@ant-design/icons-vue'
</script>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.about-card {
  background: #fff;
}

.about-card h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 32px;
  text-align: center;
}

.about-content {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 32px;
}

.author-info {
  flex: 1;
}

.author-info h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.bio {
  color: #666;
  font-size: 16px;
  margin-bottom: 16px;
}

.contact-info p {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.about-text h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 16px;
}

.about-text p {
  color: #666;
  line-height: 1.8;
  margin-bottom: 16px;
}

.about-text ul {
  color: #666;
  line-height: 1.8;
  margin-left: 24px;
}

.about-text li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .about-content {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-info p {
    justify-content: center;
  }
}
</style>
