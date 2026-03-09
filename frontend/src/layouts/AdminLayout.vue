<template>
  <a-layout class="admin-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      class="sider"
    >
      <div class="logo">
        <router-link to="/admin">HS Blog Admin</router-link>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
      >
        <a-menu-item key="dashboard">
          <DashboardOutlined />
          <router-link to="/admin">管理首页</router-link>
        </a-menu-item>
        <a-sub-menu key="post">
          <template #icon>
            <FileTextOutlined />
          </template>
          <template #title>博客管理</template>
          <a-menu-item key="post-list">
            <router-link to="/admin/posts">博客列表</router-link>
          </a-menu-item>
          <a-menu-item key="post-create">
            <router-link to="/admin/posts/create">新增博客</router-link>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="category">
          <AppstoreOutlined />
          <router-link to="/admin/categories">分类标签</router-link>
        </a-menu-item>
        <a-menu-item key="comment">
          <MessageOutlined />
          <router-link to="/admin/comments">评论管理</router-link>
        </a-menu-item>
        <a-menu-item key="profile">
          <UserOutlined />
          <router-link to="/admin/profile">个人中心</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <MenuUnfoldOutlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <MenuFoldOutlined
            v-else
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item>首页</a-breadcrumb-item>
            <a-breadcrumb-item v-if="breadcrumbTitle">{{ breadcrumbTitle }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-dropdown>
            <a class="ant-dropdown-link" @click.prevent>
              <a-avatar :size="32" :src="userStore.user?.avatar" />
              <span class="username">{{ userStore.username }}</span>
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)
const selectedKeys = ref(['dashboard'])
const openKeys = ref([])

const breadcrumbTitle = computed(() => {
  const titles = {
    '/admin': '管理首页',
    '/admin/posts': '博客列表',
    '/admin/posts/create': '新增博客',
    '/admin/categories': '分类标签',
    '/admin/comments': '评论管理',
    '/admin/profile': '个人中心'
  }
  return titles[route.path] || ''
})

watch(() => route.path, (newPath) => {
  if (newPath === '/admin') {
    selectedKeys.value = ['dashboard']
  } else if (newPath.startsWith('/admin/posts')) {
    selectedKeys.value = ['post-list']
    openKeys.value = ['post']
  } else if (newPath === '/admin/categories') {
    selectedKeys.value = ['category']
  } else if (newPath === '/admin/comments') {
    selectedKeys.value = ['comment']
  } else if (newPath === '/admin/profile') {
    selectedKeys.value = ['profile']
  }
}, { immediate: true })

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.sider {
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
}

.logo {
  height: 64px;
  line-height: 64px;
  text-align: center;
  background: #002140;
}

.logo a {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
}

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-left: 200px;
  transition: margin-left 0.2s;
}

.admin-layout:has(.sider.ant-layout-sider-collapsed) .header {
  margin-left: 80px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.breadcrumb {
  margin-left: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  margin-left: 8px;
}

.content {
  margin: 24px 24px 0;
  padding: 24px;
  background: #fff;
  min-height: calc(100vh - 112px);
  margin-left: 224px;
  transition: margin-left 0.2s;
}

.admin-layout:has(.sider.ant-layout-sider-collapsed) .content {
  margin-left: 104px;
}
</style>
