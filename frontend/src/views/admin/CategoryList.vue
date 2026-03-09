<template>
  <div class="category-list-container">
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="categories" tab="分类管理">
        <div class="tab-header">
          <a-button type="primary" @click="showCategoryModal()">
            <PlusOutlined /> 新增分类
          </a-button>
        </div>

        <a-table
          :columns="categoryColumns"
          :data-source="categories"
          :loading="loading"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="showCategoryModal(record)">
                  编辑
                </a-button>
                <a-popconfirm
                  title="确定要删除这个分类吗？"
                  @confirm="handleDeleteCategory(record.id)"
                >
                  <a-button type="link" size="small" danger>删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="tags" tab="标签管理">
        <div class="tab-header">
          <a-button type="primary" @click="showTagModal()">
            <PlusOutlined /> 新增标签
          </a-button>
        </div>

        <a-table
          :columns="tagColumns"
          :data-source="tags"
          :loading="loading"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-popconfirm
                title="确定要删除这个标签吗？"
                @confirm="handleDeleteTag(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <a-modal
      v-model:open="categoryModalVisible"
      :title="categoryModalTitle"
      @ok="handleCategorySubmit"
      @cancel="categoryModalVisible = false"
    >
      <a-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        layout="vertical"
      >
        <a-form-item label="分类名称" name="name">
          <a-input
            v-model:value="categoryForm.name"
            placeholder="请输入分类名称"
            :max-length="50"
          />
        </a-form-item>
        <a-form-item label="分类描述" name="description">
          <a-textarea
            v-model:value="categoryForm.description"
            placeholder="请输入分类描述"
            :rows="3"
            :max-length="200"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="tagModalVisible"
      title="新增标签"
      @ok="handleTagSubmit"
      @cancel="tagModalVisible = false"
    >
      <a-form
        ref="tagFormRef"
        :model="tagForm"
        :rules="tagRules"
        layout="vertical"
      >
        <a-form-item label="标签名称" name="name">
          <a-input
            v-model:value="tagForm.name"
            placeholder="请输入标签名称"
            :max-length="50"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { categoryApi } from '@/api/category'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const activeTab = ref('categories')
const loading = ref(false)
const categories = ref([])
const tags = ref([])

const categoryModalVisible = ref(false)
const categoryModalTitle = ref('新增分类')
const categoryFormRef = ref()
const categoryForm = reactive({
  id: null,
  name: '',
  description: ''
})
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

const tagModalVisible = ref(false)
const tagFormRef = ref()
const tagForm = reactive({
  name: ''
})
const tagRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' }
  ]
}

const categoryColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '分类名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '文章数量',
    dataIndex: 'post_count',
    key: 'post_count',
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

const tagColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '标签名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '文章数量',
    dataIndex: 'post_count',
    key: 'post_count',
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
    width: 100,
    fixed: 'right'
  }
]

const loadCategories = async () => {
  loading.value = true
  try {
    const data = await categoryApi.getCategories()
    categories.value = data
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    loading.value = false
  }
}

const loadTags = async () => {
  loading.value = true
  try {
    const data = await categoryApi.getTags()
    tags.value = data
  } catch (error) {
    console.error('加载标签失败:', error)
  } finally {
    loading.value = false
  }
}

const showCategoryModal = (record = null) => {
  if (record) {
    categoryModalTitle.value = '编辑分类'
    categoryForm.id = record.id
    categoryForm.name = record.name
    categoryForm.description = record.description
  } else {
    categoryModalTitle.value = '新增分类'
    categoryForm.id = null
    categoryForm.name = ''
    categoryForm.description = ''
  }
  categoryModalVisible.value = true
}

const handleCategorySubmit = async () => {
  try {
    await categoryFormRef.value.validate()
  } catch (error) {
    return
  }

  try {
    if (categoryForm.id) {
      await categoryApi.updateCategory(categoryForm.id, {
        name: categoryForm.name,
        description: categoryForm.description
      })
      message.success('更新成功')
    } else {
      await categoryApi.createCategory({
        name: categoryForm.name,
        description: categoryForm.description
      })
      message.success('创建成功')
    }
    categoryModalVisible.value = false
    loadCategories()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleDeleteCategory = async (id) => {
  try {
    await categoryApi.deleteCategory(id)
    message.success('删除成功')
    loadCategories()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const showTagModal = () => {
  tagForm.name = ''
  tagModalVisible.value = true
}

const handleTagSubmit = async () => {
  try {
    await tagFormRef.value.validate()
  } catch (error) {
    return
  }

  try {
    await categoryApi.createTag({
      name: tagForm.name
    })
    message.success('创建成功')
    tagModalVisible.value = false
    loadTags()
  } catch (error) {
    console.error('创建失败:', error)
  }
}

const handleDeleteTag = async (id) => {
  try {
    await categoryApi.deleteTag(id)
    message.success('删除成功')
    loadTags()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

onMounted(() => {
  loadCategories()
  loadTags()
})
</script>

<style scoped>
.category-list-container {
  min-height: 400px;
}

.tab-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
