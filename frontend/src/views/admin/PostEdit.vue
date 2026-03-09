<template>
  <div class="post-edit-container">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑博客' : '新增博客' }}</h2>
      <a-space>
        <a-button @click="goBack">返回</a-button>
        <a-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '更新' : '发布' }}
        </a-button>
      </a-space>
    </div>

    <a-card>
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
      >
        <a-row :gutter="24">
          <a-col :span="16">
            <a-form-item label="标题" name="title">
              <a-input
                v-model:value="formData.title"
                placeholder="请输入博客标题"
                :max-length="200"
                show-count
              />
            </a-form-item>

            <a-form-item label="摘要" name="summary">
              <a-textarea
                v-model:value="formData.summary"
                placeholder="请输入博客摘要"
                :rows="3"
                :max-length="500"
                show-count
              />
            </a-form-item>

            <a-form-item label="内容" name="content">
              <a-textarea
                v-model:value="formData.content"
                placeholder="请输入博客内容，支持 Markdown 语法"
                :rows="20"
              />
              <div class="markdown-tips">
                <p>支持 Markdown 语法：</p>
                <ul>
                  <li>标题：# 一级标题，## 二级标题</li>
                  <li>列表：- 列表项</li>
                  <li>代码：```代码```</li>
                  <li>链接：[链接文字](URL)</li>
                  <li>图片：![图片描述](URL)</li>
                </ul>
              </div>
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item label="分类" name="categoryId">
              <a-select
                v-model:value="formData.categoryId"
                placeholder="请选择分类"
                allow-clear
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

            <a-form-item label="标签">
              <a-select
                v-model:value="formData.tags"
                mode="tags"
                placeholder="请输入标签"
                :max-tag-count="5"
              >
                <a-select-option
                  v-for="tag in allTags"
                  :key="tag.id"
                  :value="tag.name"
                >
                  {{ tag.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="封面图">
              <a-upload
                v-model:file-list="fileList"
                list-type="picture-card"
                :max-count="1"
                :before-upload="beforeUpload"
                @preview="handlePreview"
              >
                <div v-if="fileList.length < 1">
                  <PlusOutlined />
                  <div class="ant-upload-text">上传</div>
                </div>
              </a-upload>
              <a-modal
                :visible="previewVisible"
                :footer="null"
                @cancel="previewVisible = false"
              >
                <img alt="preview" style="width: 100%" :src="previewImage" />
              </a-modal>
            </a-form-item>

            <a-form-item label="状态" name="status">
              <a-radio-group v-model:value="formData.status">
                <a-radio value="draft">草稿</a-radio>
                <a-radio value="published">发布</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { postApi } from '@/api/post'
import { categoryApi } from '@/api/category'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const formRef = ref()
const submitting = ref(false)
const categories = ref([])
const allTags = ref([])
const fileList = ref([])
const previewVisible = ref(false)
const previewImage = ref('')

const isEdit = computed(() => !!route.params.id)

const formData = reactive({
  title: '',
  summary: '',
  content: '',
  categoryId: undefined,
  tags: [],
  status: 'draft'
})

const rules = {
  title: [
    { required: true, message: '请输入博客标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入博客内容', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB')
    return false
  }
  return false
}

const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj)
  }
  previewImage.value = file.url || file.preview
  previewVisible.value = true
}

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
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
    allTags.value = data
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

const loadPost = async () => {
  try {
    const data = await postApi.getPostById(route.params.id)
    formData.title = data.title
    formData.summary = data.summary
    formData.content = data.content
    formData.categoryId = data.category_id
    formData.tags = data.tags || []
    formData.status = data.status

    if (data.cover_image) {
      fileList.value = [{
        uid: '-1',
        name: 'cover.jpg',
        status: 'done',
        url: data.cover_image
      }]
    }
  } catch (error) {
    console.error('加载博客失败:', error)
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  submitting.value = true
  try {
    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.title)
    formDataToSend.append('content', formData.content)
    formDataToSend.append('summary', formData.summary)
    formDataToSend.append('categoryId', formData.categoryId || '')
    formDataToSend.append('tags', JSON.stringify(formData.tags))
    formDataToSend.append('status', formData.status)

    if (fileList.value.length > 0 && fileList.value[0].originFileObj) {
      formDataToSend.append('coverImage', fileList.value[0].originFileObj)
    }

    if (isEdit.value) {
      await postApi.updatePost(route.params.id, formDataToSend)
      message.success('更新成功')
    } else {
      await postApi.createPost(formDataToSend)
      message.success('创建成功')
    }

    router.push('/admin/posts')
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadCategories()
  loadTags()
  if (isEdit.value) {
    loadPost()
  }
})
</script>

<style scoped>
.post-edit-container {
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

.markdown-tips {
  margin-top: 8px;
  padding: 12px;
  background: #f6f8fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.markdown-tips p {
  margin-bottom: 8px;
  font-weight: 500;
}

.markdown-tips ul {
  margin: 0;
  padding-left: 20px;
}

.markdown-tips li {
  margin-bottom: 4px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}
</style>
