<template>
  <div class="profile-container">
    <a-row :gutter="24">
      <a-col :span="8">
        <a-card title="个人信息" class="profile-card">
          <div class="avatar-section">
            <a-avatar :size="100" :src="userStore.user?.avatar">
              {{ userStore.username?.charAt(0).toUpperCase() }}
            </a-avatar>
            <h3>{{ userStore.username }}</h3>
            <p>{{ userStore.user?.bio || '这个人很懒，什么都没写' }}</p>
          </div>
          <a-divider />
          <div class="info-list">
            <div class="info-item">
              <span class="label">用户名：</span>
              <span>{{ userStore.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span>{{ userStore.user?.email || '-' }}</span>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :span="16">
        <a-card title="修改密码" class="password-card">
          <a-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            layout="vertical"
            @finish="handleChangePassword"
          >
            <a-form-item label="原密码" name="oldPassword">
              <a-input-password
                v-model:value="passwordForm.oldPassword"
                placeholder="请输入原密码"
              />
            </a-form-item>
            <a-form-item label="新密码" name="newPassword">
              <a-input-password
                v-model:value="passwordForm.newPassword"
                placeholder="请输入新密码"
              />
            </a-form-item>
            <a-form-item label="确认密码" name="confirmPassword">
              <a-input-password
                v-model:value="passwordForm.confirmPassword"
                placeholder="请再次输入新密码"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="changing">
                修改密码
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <a-card title="编辑资料" class="profile-edit-card" style="margin-top: 24px">
          <a-form
            ref="profileFormRef"
            :model="profileForm"
            layout="vertical"
            @finish="handleUpdateProfile"
          >
            <a-form-item label="邮箱">
              <a-input
                v-model:value="profileForm.email"
                placeholder="请输入邮箱"
              />
            </a-form-item>
            <a-form-item label="个人简介">
              <a-textarea
                v-model:value="profileForm.bio"
                placeholder="请输入个人简介"
                :rows="4"
                :max-length="200"
                show-count
              />
            </a-form-item>
            <a-form-item label="头像">
              <a-upload
                v-model:file-list="avatarFileList"
                list-type="picture-card"
                :max-count="1"
                :before-upload="beforeUpload"
                @preview="handlePreview"
              >
                <div v-if="avatarFileList.length < 1">
                  <PlusOutlined />
                  <div class="ant-upload-text">上传</div>
                </div>
              </a-upload>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="updating">
                保存资料
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>

    <a-modal
      :visible="previewVisible"
      :footer="null"
      @cancel="previewVisible = false"
    >
      <img alt="preview" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'

const userStore = useUserStore()

const passwordFormRef = ref()
const profileFormRef = ref()
const changing = ref(false)
const updating = ref(false)
const previewVisible = ref(false)
const previewImage = ref('')
const avatarFileList = ref([])

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

const profileForm = reactive({
  email: '',
  bio: ''
})

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

const handleChangePassword = async () => {
  changing.value = true
  try {
    await userStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    message.success('密码修改成功')
    passwordFormRef.value.resetFields()
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    changing.value = false
  }
}

const handleUpdateProfile = async () => {
  updating.value = true
  try {
    const formData = new FormData()
    formData.append('email', profileForm.email)
    formData.append('bio', profileForm.bio)
    
    if (avatarFileList.value.length > 0 && avatarFileList.value[0].originFileObj) {
      formData.append('avatar', avatarFileList.value[0].originFileObj)
    }

    await userStore.updateProfile(formData)
    message.success('资料更新成功')
    avatarFileList.value = []
  } catch (error) {
    console.error('更新资料失败:', error)
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  if (userStore.user) {
    profileForm.email = userStore.user.email || ''
    profileForm.bio = userStore.user.bio || ''
  }
})
</script>

<style scoped>
.profile-container {
  min-height: 500px;
}

.profile-card {
  position: sticky;
  top: 24px;
}

.avatar-section {
  text-align: center;
}

.avatar-section h3 {
  margin: 16px 0 8px;
  font-size: 20px;
  color: #333;
}

.avatar-section p {
  color: #666;
  margin: 0;
}

.info-list {
  margin-top: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #999;
}

.info-item span:last-child {
  color: #333;
}

.password-card,
.profile-edit-card {
  height: fit-content;
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
