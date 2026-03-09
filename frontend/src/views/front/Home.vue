<template>
  <div class="home-container">
    <div class="main-content">
      <div class="post-list">
        <div class="section-header">
          <h2>最新文章</h2>
        </div>
        
        <a-spin :spinning="loading">
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
                    <span><LikeOutlined /> {{ post.likes }}</span>
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
        </a-spin>

        <a-pagination
          v-if="pagination.total > 0"
          v-model:current="pagination.current"
          v-model:pageSize="pagination.pageSize"
          :total="pagination.total"
          @change="handlePageChange"
          class="pagination"
        />
      </div>

      <div class="sidebar">
        <a-card title="博主信息" class="sidebar-card">
          <div class="author-info">
            <a-avatar :size="64" src="https://via.placeholder.com/64" />
            <h3>博主</h3>
            <p>热爱技术，分享知识</p>
          </div>
        </a-card>

        <a-card title="热门分类" class="sidebar-card">
          <a-list :data-source="categories" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <router-link :to="`/category/${item.id}`" class="category-link">
                  {{ item.name }}
                  <span class="post-count">({{ item.post_count }})</span>
                </router-link>
              </a-list-item>
            </template>
          </a-list>
        </a-card>

        <a-card title="热门标签" class="sidebar-card">
          <div class="tags-cloud">
            <router-link
              v-for="tag in tags"
              :key="tag.id"
              :to="`/tag/${tag.id}`"
              class="tag-item"
            >
              {{ tag.name }}
            </router-link>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postApi } from '@/api/post'
import { categoryApi } from '@/api/category'
import dayjs from 'dayjs'
import {
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  LikeOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)
const posts = ref([])
const categories = ref([])
const tags = ref([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const loadPosts = async () => {
  loading.value = true
  try {
    const data = await postApi.getPosts({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
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

const loadCategories = async () => {
  try {
    const data = await categoryApi.getCategories()
    categories.value = data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadTags = async () => {
  try {
    const data = await categoryApi.getTags()
    tags.value = data.filter(tag => tag.post_count > 0).slice(0, 10)
  } catch (error) {
    console.error('加载标签失败:', error)
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
  loadPosts()
  loadCategories()
  loadTags()
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.post-list {
  min-height: 500px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  color: #333;
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

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  margin-bottom: 16px;
}

.author-info {
  text-align: center;
}

.author-info h3 {
  margin: 12px 0 8px;
  color: #333;
}

.author-info p {
  color: #666;
  font-size: 14px;
}

.category-link {
  color: #333;
  text-decoration: none;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.category-link:hover {
  color: #1890ff;
}

.post-count {
  color: #999;
  font-size: 12px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-block;
  padding: 4px 12px;
  background: #f0f2f5;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.tag-item:hover {
  background: #1890ff;
  color: #fff;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: -1;
  }
}
</style>
