<template>
  <t-upload theme="image" accept="image/*" :max="1" :size-limit="{ size: 2, unit: 'MB' }"
            tips="支持上传 jpg、png 格式图片，文件大小不超过 2MB" :request-method="uploadRequest"
            @success="handleUploadSuccess"
            @fail="handleUploadFail" :files="defaultFiles" @remove="handleRemove">
  </t-upload>
</template>

<script lang="ts" setup>
import type {UploadFile, RequestMethodResponse, TdUploadProps} from 'tdesign-vue-next'
import {postAttachment} from "@/utils/utools/DbStorageUtil";
import MessageUtil from "@/utils/modal/MessageUtil";

const value = defineModel({
  type: String,
  default: ''
})

// 默认文件列表，用于显示已有图片
const defaultFiles = computed(() => {
  if (value.value) {
    return [{
      name: 'uploaded-image',
      url: value.value,
      status: 'success' as const
    }]
  }
  return []
})

// 自定义上传方法
const uploadRequest = async (file: UploadFile): Promise<RequestMethodResponse> => {
  try {
    const docId = await postAttachment(file.raw as File)
    return {
      status: 'success',
      response: {docId}
    }
  } catch (error) {
    console.error('上传失败:', error)
    return {
      status: 'fail',
      error: error instanceof Error ? error.message : '上传失败',
      response: {}
    }
  }
}

// 上传成功回调
const handleUploadSuccess = (context: { response?: { docId: string } }) => {
  const {response} = context
  if (response && response.docId) {
    value.value = response.docId  // 保存真实地访问链接
    MessageUtil.success('图片上传成功')
  }
}

// 上传失败回调
const handleUploadFail: TdUploadProps["onFail"] = ({e}) => {
  MessageUtil.error('图片上传失败')
}

const handleRemove: TdUploadProps['onRemove'] = () => {
  value.value = '';
}
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
