<template>
  <div class="category-container">
    <a-spin :spinning="loading">
      <div v-if="category" class="category-header">
        <h1>{{ category.name }}</h1>
        <p v-if="category.description">{{ category.description }}</p>
        <span class="post-count">共 {{ pagination.total }} 篇文章</span>
      </div>

      <div v-if="posts.length > 0" class="posts">
        <a-card
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          hoverable
          @click="goToPost(post.id)"
        >
          <template #cover>
            <img v-if="post.cover_image" :src="post.cover_image" :alt="post.title" />
          </template>
          <a-card-meta>
            <template #title>
              <h3>{{ post.title }}</h3>
            </template>
            <template #description>
              <div class="post-meta">
                <span><CalendarOutlined /> {{ formatDate(post.created_at) }}</span>
                <span><UserOutlined /> {{ post.author_name }}</span>
                <span><EyeOutlined /> {{ post.views }}</span>
              </div>
            </template>
          </a-card-meta>
          <p class="post-summary">{{ post.summary }}</p>
          <div class="post-tags">
            <a-tag v-for="tag in post.tags" :key="tag" color="blue">{{ tag }}</a-tag>
          </div>
        </a-card>
      </div>
      <a-empty v-else description="暂无文章" />

      <a-pagination
        v-if="pagination.total > 0"
        v-model:current="pagination.current"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        @change="handlePageChange"
        class="pagination"
      />
    </a-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { postApi } from '@/api/post'
import { categoryApi } from '@/api/category'
import dayjs from 'dayjs'
import {
  CalendarOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const category = ref(null)
const posts = ref([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const loadCategory = async () => {
  try {
    const data = await categoryApi.getCategoryById(route.params.id)
    category.value = data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadPosts = async () => {
  loading.value = true
  try {
    const data = await postApi.getPosts({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      category: route.params.id,
      status: 'published'
    })
    posts.value = data.posts
    pagination.value = data.pagination
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

const goToPost = (id) => {
  router.push(`/post/${id}`)
}

const handlePageChange = (page, pageSize) => {
  pagination.value.current = page
  pagination.value.pageSize = pageSize
  loadPosts()
}

onMounted(() => {
  loadCategory()
  loadPosts()
})
</script>

<style scoped>
.category-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.category-header {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.category-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.category-header p {
  color: #666;
  margin-bottom: 12px;
}

.post-count {
  color: #999;
  font-size: 14px;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
}

.post-card h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.post-meta {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 14px;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-summary {
  color: #666;
  line-height: 1.6;
  margin: 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 24px;
  text-align: center;
}
</style>
