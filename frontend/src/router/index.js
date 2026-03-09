import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/front/Home.vue'),
    meta: { layout: 'FrontLayout' }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('@/views/front/PostDetail.vue'),
    meta: { layout: 'FrontLayout' }
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () => import('@/views/front/Category.vue'),
    meta: { layout: 'FrontLayout' }
  },
  {
    path: '/tag/:id',
    name: 'Tag',
    component: () => import('@/views/front/Tag.vue'),
    meta: { layout: 'FrontLayout' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/front/About.vue'),
    meta: { layout: 'FrontLayout' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/admin/Login.vue'),
    meta: { layout: 'BlankLayout' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { layout: 'AdminLayout', requiresAuth: true }
  },
  {
    path: '/admin/posts',
    name: 'AdminPosts',
    component: () => import('@/views/admin/PostList.vue'),
    meta: { layout: 'AdminLayout', requiresAuth: true }
  },
  {
    path: '/admin/posts/create',
    name: 'AdminPostCreate',
    component: () => import('@/views/admin/PostEdit.vue'),
    meta: { layout: 'AdminLayout', requiresAuth: true }
  },
  {
    path: '/admin/posts/:id/edit',
    name: 'AdminPostEdit',
    component: () => import('@/views/admin/PostEdit.vue'),
    meta: { layout: 'AdminLayout', requiresAuth: true }
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import('@/views/admin/CategoryList.vue'),
    meta: { layout: 'AdminLayout', requiresAuth: true }
  },
  {
    path: '/admin/comments',
    name: 'AdminComments',
    component: () => import('@/views/admin/CommentList.vue'),
    meta: { layout: 'AdminLayout', requiresAuth: true }
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: () => import('@/views/admin/Profile.vue'),
    meta: { layout: 'AdminLayout', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
