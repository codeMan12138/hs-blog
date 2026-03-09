<template>
  <div class="comment-list-container">
    <div class="page-header">
      <h2>评论管理</h2>
    </div>

    <a-card>
      <a-form layout="inline" class="search-form">
        <a-form-item label="状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 120px"
            @change="loadComments"
          >
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>

      <a-table
        :columns="columns"
        :data-source="comments"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'username'">
            <a-avatar :size="32">{{ record.username.charAt(0).toUpperCase() }}</a-avatar>
            <span style="margin-left: 8px">{{ record.username }}</span>
          </template>
          <template v-else-if="column.key === 'content'">
            <a-tooltip :title="record.content">
              <span class="content-text">{{ record.content }}</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'post_title'">
            <router-link :to="`/post/${record.post_id}`" target="_blank">
              {{ record.post_title }}
            </router-link>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 'approved' ? 'green' : 'orange'">
              {{ record.status === 'approved' ? '已通过' : '待审核' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.status === 'pending'"
                type="link"
                size="small"
                @click="handleApprove(record.id)"
              >
                通过
              </a-button>
              <a-popconfirm
                title="确定要删除这条评论吗？"
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
import { ref, reactive, onMounted } from 'vue'
import { commentApi } from '@/api/comment'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const loading = ref(false)
const comments = ref([])
const searchForm = reactive({
  status: undefined
})
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  {
    title: '用户',
    dataIndex: 'username',
    key: 'username',
    width: 150
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    ellipsis: true
  },
  {
    title: '文章',
    dataIndex: 'post_title',
    key: 'post_title',
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
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
    width: 150,
    fixed: 'right'
  }
]

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const loadComments = async () => {
  loading.value = true
  try {
    const data = await commentApi.getComments({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      ...searchForm
    })
    comments.value = data.comments
    pagination.value = data.pagination
  } catch (error) {
    console.error('加载评论列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadComments()
}

const handleApprove = async (id) => {
  try {
    await commentApi.approveComment(id)
    message.success('审核通过')
    loadComments()
  } catch (error) {
    console.error('审核失败:', error)
  }
}

const handleDelete = async (id) => {
  try {
    await commentApi.deleteComment(id)
    message.success('删除成功')
    loadComments()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.search-form {
  margin-bottom: 16px;
}

.content-text {
  display: inline-block;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
