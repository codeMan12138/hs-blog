<template>
  <div class="dashboard-container">
    <a-row :gutter="24" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="博客总数"
            :value="stats.posts"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <FileTextOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="分类数量"
            :value="stats.categories"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <AppstoreOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="评论数量"
            :value="stats.comments"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <MessageOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="总访问量"
            :value="stats.views"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <EyeOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="最近发布的博客" class="recent-posts">
      <a-table
        :columns="columns"
        :data-source="recentPosts"
        :pagination="false"
        :loading="loading"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <router-link :to="`/post/${record.id}`" target="_blank">
              {{ record.title }}
            </router-link>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'published' ? 'green' : 'orange'">
              {{ record.status === 'published' ? '已发布' : '草稿' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <router-link :to="`/admin/posts/${record.id}/edit`">
                <a-button type="link" size="small">编辑</a-button>
              </router-link>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { postApi } from '@/api/post'
import dayjs from 'dayjs'
import {
  FileTextOutlined,
  AppstoreOutlined,
  MessageOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'

const loading = ref(false)
const stats = ref({
  posts: 0,
  categories: 0,
  comments: 0,
  views: 0
})
const recentPosts = ref([])

const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '发布时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 100
  }
]

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const loadStats = async () => {
  loading.value = true
  try {
    const data = await postApi.getDashboardStats()
    stats.value = data.stats
    recentPosts.value = data.recentPosts
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  text-align: center;
}

.recent-posts {
  margin-top: 24px;
}
</style>
