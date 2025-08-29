import { useSnowflake } from "@/hooks";


/**
 * 存储附件到新文档
 * @param attachment 附件 buffer
 * @param docId 文档ID
 */
export async function postAttachment(attachment: Blob | File, docId?: string): Promise<string> {
  if (!docId) {
    const id = useSnowflake().nextId();
    docId = '/attachment/' + id;
  }
  const buffer = await attachment.arrayBuffer();
  const res = await utools.db.promises.postAttachment(docId, new Uint8Array(buffer), attachment.type);
  if (res.error) {
    return Promise.reject(res.message);
  }
  return docId;
}

/**
 * 删除附件
 * @param docId 文档ID
 * @return 删除结果
 */
export async function deleteAttachment(docId: string): Promise<boolean> {
  try {
    const res = await utools.db.promises.remove(docId);
    if (res.error) {
      console.error('删除附件失败:', res.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('删除附件异常:', error);
    return false;
  }
}

/**
 * 异步获取附件
 * @param docId 文档ID
 * @return 文件链接
 */
export async function getAttachmentByAsync(docId: string): Promise<Blob | null> {
  const data = await utools.db.promises.getAttachment(docId);
  const type = await utools.db.promises.getAttachmentType(docId)
  if (!data) {
    return null
  }
  return new Blob([data.buffer as ArrayBuffer], { type: type || undefined });
}
