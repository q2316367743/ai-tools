<template>
  <t-upload theme="image" accept="image/*" :max="1" :size-limit="{ size: 2, unit: 'MB' }"
            tips="支持上传 jpg、png 格式图片，文件大小不超过 2MB" :request-method="uploadRequest"
            @success="handleUploadSuccess"
            @fail="handleUploadFail" :files="defaultFiles" @remove="handleRemove"
            :loading="uploading">
  </t-upload>
</template>

<script lang="ts" setup>
import type {UploadFile, RequestMethodResponse, TdUploadProps} from 'tdesign-vue-next'
import {postAttachment, deleteAttachment, getAttachmentByAsync} from "@/utils/utools/AttachmentUtil";
import MessageUtil from "@/utils/modal/MessageUtil";

interface Props {
  itemId: string // 必需的item ID，用于生成标准化的附件key
}

const props = defineProps<Props>()

const uploading = ref(false)
const previewUrl = ref('')

// 生成标准化的附件key
const getAttachmentKey = (): string => {
  return `/attachment/${props.itemId}`
}

// 检查是否已有附件并创建预览URL
const checkExistingAttachment = async () => {
  const key = getAttachmentKey()
  try {
    const attachment = await getAttachmentByAsync(key)
    if (attachment) {
      // 释放之前的URL
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
      // 创建新的预览URL
      previewUrl.value = URL.createObjectURL(attachment)
    }
  } catch (error) {
    console.log('没有找到现有附件')
  }
}

// 默认文件列表，用于显示已有图片
const defaultFiles = computed(() => {
  if (previewUrl.value) {
    return [{
      name: 'uploaded-image',
      url: previewUrl.value,
      status: 'success' as const
    }]
  }
  return []
})

// 删除旧附件
const deleteOldAttachment = async (): Promise<boolean> => {
  const key = getAttachmentKey()
  try {
    const success = await deleteAttachment(key)
    if (success) {
      // 释放预览URL
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
        previewUrl.value = ''
      }
    }
    return success
  } catch (error) {
    console.error('删除旧附件异常:', error)
    return false
  }
}

// 自定义上传方法
const uploadRequest = async (file: UploadFile): Promise<RequestMethodResponse> => {
  try {
    uploading.value = true
    
    // 先删除旧附件
    await deleteOldAttachment()
    
    // 使用固定的附件key
    const docId = getAttachmentKey()
    
    // 上传新附件
    const resultDocId = await postAttachment(file.raw as File, docId)
    
    return {
      status: 'success',
      response: {
        docId: resultDocId,
        files: [file]
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
    return {
      status: 'fail',
      error: error instanceof Error ? error.message : '上传失败',
      response: {}
    }
  } finally {
    uploading.value = false
  }
}

// 上传成功回调
const handleUploadSuccess = async (context: { response?: { docId: string } }) => {
  const {response} = context
  if (response && response.docId) {
    // 重新获取附件并创建预览URL
    try {
      const attachment = await getAttachmentByAsync(response.docId)
      if (attachment) {
        // 释放之前的URL
        if (previewUrl.value) {
          URL.revokeObjectURL(previewUrl.value)
        }
        // 创建新的预览URL
        previewUrl.value = URL.createObjectURL(attachment)
      }
    } catch (error) {
      console.error('获取上传后的附件失败:', error)
    }
    MessageUtil.success('图片上传成功')
  }
}

// 上传失败回调
const handleUploadFail: TdUploadProps["onFail"] = ({e}) => {
  MessageUtil.error('图片上传失败', e)
}

// 删除附件
const handleRemove: TdUploadProps['onRemove'] = async () => {
  await deleteOldAttachment()
}

// 初始化时检查现有附件
onMounted(() => {
  checkExistingAttachment()
})

// 组件卸载时释放URL资源
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped lang="less">
.icon-preview {
  img {
    max-width: 100%;
    max-height: 200px;
    object-fit: contain;
  }
}
</style>
