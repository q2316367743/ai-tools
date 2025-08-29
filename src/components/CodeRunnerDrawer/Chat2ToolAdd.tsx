import {AiToolPost} from "@/types/AiTool";
import MessageUtil from "@/utils/modal/MessageUtil";
import {DialogPlugin, Form, FormItem, Input, InputNumber, Switch, TagInput, Textarea} from "tdesign-vue-next";
import {useAiToolsStore} from "@/store";

export function openChat2ToolDialog(content: string, onSuccess: () => void) {
  const form = ref<AiToolPost>({
    content: content,
    icon: '',
    title: '',
    description: '',
    tags: [],
    sessionId: '',
    center: true,
    mini: false,
  })
  const dp = DialogPlugin({
    header: '添加为工具',
    placement: 'center',
    confirmBtn: '新增',
    default: () => <Form>
      <FormItem label={'标题'} name={'title'} rules={[{required: true, message: '标题必填'}]}>
        <Input clearable v-model={[form.value.title]}/>
      </FormItem>
      <FormItem label={'标签'} name={'tags'}>
        <TagInput v-model={form.value.tags}/>
      </FormItem>
      <FormItem label={'描述'} name={'description'}>
        <Textarea v-model={[form.value.description]} autosize={{minRows: 3, maxRows: 6}}/>
      </FormItem>
      <FormItem label="小窗" name="mini" help="是否小窗打开，使用小窗打开就可以实现多开">
        <Switch v-model={form.value.mini}/>
      </FormItem>
      {form.value.mini && <>
        <FormItem label="宽" name="width">
          <InputNumber v-model={form.value.width} defaultValue={800} placeholder="请输入窗口宽"/>
        </FormItem>
        <FormItem label="高" name="height">
          <InputNumber v-model={form.value.height} defaultValue={600} placeholder="请输入窗口高"/>
        </FormItem>
        <FormItem label="是否居中" name="center">
          <Switch v-model={form.value.center} defaultValue={true}/>
        </FormItem>
        <FormItem label="x" name="x">
          <InputNumber v-model={form.value.x} placeholder="请输入窗口x坐标" disabled={form.value.center}/>
        </FormItem>
        <FormItem label="y" name="y">
          <InputNumber v-model={form.value.y} placeholder="请输入窗口y坐标" disabled={form.value.center}/>
        </FormItem>
      </>}
    </Form>,
    onConfirm() {
      useAiToolsStore().add(form.value).then(() => {
        MessageUtil.success('添加成功');
        dp.destroy();
        onSuccess()
      });

    },
  })
}