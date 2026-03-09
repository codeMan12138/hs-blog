<template>
  <a-layout class="front-layout">
    <a-layout-header class="header">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">HS Blog</router-link>
        </div>
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          :style="{ lineHeight: '64px', border: 'none' }"
        >
          <a-menu-item key="home">
            <router-link to="/">首页</router-link>
          </a-menu-item>
          <a-menu-item key="categories">
            <router-link to="/categories">分类</router-link>
          </a-menu-item>
          <a-menu-item key="about">
            <router-link to="/about">关于</router-link>
          </a-menu-item>
        </a-menu>
        <div class="header-right">
          <router-link v-if="!userStore.isLoggedIn" to="/login" class="login-btn">
            登录
          </router-link>
          <a-dropdown v-else>
            <a class="ant-dropdown-link" @click.prevent>
              {{ userStore.username }}
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <router-link to="/admin">管理后台</router-link>
                </a-menu-item>
                <a-menu-item @click="handleLogout">
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-header>
    <a-layout-content class="content">
      <router-view />
    </a-layout-content>
    <a-layout-footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 HS Blog. All rights reserved.</p>
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { DownOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const selectedKeys = ref(['home'])

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.front-layout {
  min-height: 100vh;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo a {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  text-decoration: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.login-btn {
  color: #1890ff;
  text-decoration: none;
}

.content {
  margin-top: 64px;
  padding: 24px 0;
  background: #f0f2f5;
  min-height: calc(100vh - 128px);
}

.footer {
  text-align: center;
  background: #001529;
  color: #fff;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}
</style>
