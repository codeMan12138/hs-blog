<template>
  <div class="post-detail-container">
    <a-spin :spinning="loading">
      <div v-if="post" class="post-detail">
        <a-card class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <span><CalendarOutlined /> {{ formatDate(post.created_at) }}</span>
            <span><UserOutlined /> {{ post.author_name }}</span>
            <span v-if="post.category_name">
              <FolderOutlined /> {{ post.category_name }}
            </span>
            <span><EyeOutlined /> {{ post.views }}</span>
            <span><LikeOutlined /> {{ post.likes }}</span>
          </div>
          <div v-if="post.tags && post.tags.length > 0" class="post-tags">
            <a-tag v-for="tag in post.tags" :key="tag" color="blue">{{ tag }}</a-tag>
          </div>
        </a-card>

        <a-card class="post-content">
          <div v-html="renderedContent" class="markdown-body"></div>
        </a-card>

        <a-card class="post-actions">
          <a-space>
            <a-button type="primary" @click="handleLike">
              <LikeOutlined /> 点赞
            </a-button>
            <a-button>
              <StarOutlined /> 收藏
            </a-button>
          </a-space>
        </a-card>

        <a-card class="comments-section">
          <template #title>
            <span>评论 ({{ comments.length }})</span>
          </template>

          <div class="comment-form">
            <a-textarea
              v-model:value="commentContent"
              placeholder="写下你的评论..."
              :rows="4"
              :max-length="500"
              show-count
            />
            <a-button
              type="primary"
              @click="submitComment"
              :loading="submitting"
              style="margin-top: 12px"
            >
              发表评论
            </a-button>
          </div>

          <a-list
            v-if="comments.length > 0"
            :data-source="comments"
            class="comment-list"
          >
            <template #renderItem="{ item }">
              <a-list-item class="comment-item">
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar>{{ item.username.charAt(0).toUpperCase() }}</a-avatar>
                  </template>
                  <template #title>
                    <div class="comment-header">
                      <span class="comment-author">{{ item.username }}</span>
                      <span class="comment-time">{{ formatDate(item.created_at) }}</span>
                    </div>
                  </template>
                  <template #description>
                    <p class="comment-content">{{ item.content }}</p>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          <a-empty v-else description="暂无评论" />
        </a-card>
      </div>
      <a-empty v-else description="文章不存在" />
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { postApi } from '@/api/post'
import { commentApi } from '@/api/comment'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import dayjs from 'dayjs'
import {
  CalendarOutlined,
  UserOutlined,
  FolderOutlined,
  EyeOutlined,
  LikeOutlined,
  StarOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const post = ref(null)
const comments = ref([])
const commentContent = ref('')
const submitting = ref(false)

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  const html = marked(post.value.content)
  return DOMPurify.sanitize(html)
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const loadPost = async () => {
  loading.value = true
  try {
    const data = await postApi.getPostById(route.params.id)
    post.value = data
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  try {
    const data = await commentApi.getComments({
      postId: route.params.id,
      status: 'approved'
    })
    comments.value = data.comments
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

const handleLike = async () => {
  try {
    await postApi.likePost(route.params.id)
    message.success('点赞成功')
    post.value.likes += 1
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) {
    message.warning('请输入评论内容')
    return
  }

  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  submitting.value = true
  try {
    await commentApi.createComment({
      postId: route.params.id,
      content: commentContent.value
    })
    message.success('评论成功')
    commentContent.value = ''
    loadComments()
  } catch (error) {
    console.error('评论失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadPost()
  loadComments()
})
</script>

<style scoped>
.post-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.post-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-header {
  background: #fff;
}

.post-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 16px;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #999;
  font-size: 14px;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-tags {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.post-content {
  background: #fff;
}

.markdown-body {
  line-height: 1.8;
  color: #333;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body p {
  margin-bottom: 16px;
}

.markdown-body code {
  background: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}

.markdown-body pre {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-body pre code {
  background: transparent;
  padding: 0;
}

.markdown-body blockquote {
  border-left: 4px solid #dfe2e5;
  padding-left: 16px;
  color: #6a737d;
  margin-bottom: 16px;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-body img {
  max-width: 100%;
  height: auto;
}

.post-actions {
  background: #fff;
}

.comments-section {
  background: #fff;
}

.comment-form {
  margin-bottom: 24px;
}

.comment-list {
  margin-top: 24px;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-author {
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  color: #666;
  line-height: 1.6;
  margin: 8px 0 0;
}
</style>
