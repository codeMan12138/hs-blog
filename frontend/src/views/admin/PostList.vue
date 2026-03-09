<template>
  <div class="post-list-container">
    <div class="page-header">
      <h2>博客管理</h2>
      <a-button type="primary" @click="goToCreate">
        <PlusOutlined /> 新增博客
      </a-button>
    </div>

    <a-card>
      <a-form layout="inline" class="search-form">
        <a-form-item label="标题">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="请输入标题"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="分类">
          <a-select
            v-model:value="searchForm.category"
            placeholder="请选择分类"
            allow-clear
            style="width: 150px"
          >
            <a-select-option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 120px"
          >
            <a-select-option value="published">已发布</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined /> 搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-table
        :columns="columns"
        :data-source="posts"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'cover_image'">
            <img
              v-if="record.cover_image"
              :src="record.cover_image"
              :alt="record.title"
              class="cover-image"
            />
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'title'">
            <a-tooltip :title="record.title">
              <span class="title-text">{{ record.title }}</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'category_name'">
            {{ record.category_name || '-' }}
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
              <router-link :to="`/post/${record.id}`" target="_blank">
                <a-button type="link" size="small">查看</a-button>
              </router-link>
              <router-link :to="`/admin/posts/${record.id}/edit`">
                <a-button type="link" size="small">编辑</a-button>
              </router-link>
              <a-popconfirm
                title="确定要删除这篇博客吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postApi } from '@/api/post'
import { categoryApi } from '@/api/category'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

const loading = ref(false)
const posts = ref([])
const categories = ref([])
const searchForm = ref({
  keyword: '',
  category: undefined,
  status: undefined
})
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  {
    title: '封面',
    dataIndex: 'cover_image',
    key: 'cover_image',
    width: 80
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true
  },
  {
    title: '分类',
    dataIndex: 'category_name',
    key: 'category_name',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '浏览量',
    dataIndex: 'views',
    key: 'views',
    width: 100
  },
  {
    title: '点赞数',
    dataIndex: 'likes',
    key: 'likes',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const loadPosts = async () => {
  loading.value = true
  try {
    const data = await postApi.getPosts({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      ...searchForm.value
    })
    posts.value = data.posts
    pagination.value = data.pagination
  } catch (error) {
    console.error('加载博客列表失败:', error)
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

const goToCreate = () => {
  router.push('/admin/posts/create')
}

const handleSearch = () => {
  pagination.value.current = 1
  loadPosts()
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    category: undefined,
    status: undefined
  }
  pagination.value.current = 1
  loadPosts()
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadPosts()
}

const handleDelete = async (id) => {
  try {
    await postApi.deletePost(id)
    message.success('删除成功')
    loadPosts()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

onMounted(() => {
  loadPosts()
  loadCategories()
})
</script>

<style scoped>
.post-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.search-form {
  margin-bottom: 16px;
}

.cover-image {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.title-text {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
