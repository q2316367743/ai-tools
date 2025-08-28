import {useUtoolsKvStorage} from "@/hooks/UtoolsKvStorage";
import {LocalNameEnum} from "@/global/LocalNameEnum";

export const activeKey = ref('/home/welcome');
export const collapsed = ref(false);


export const toggleCollapsed = useToggle(collapsed);
export const autoHideCollapsed = () => {
  if (window.innerWidth < 960) {
    collapsed.value = true;
  }
}

export const model = useUtoolsKvStorage<string>(LocalNameEnum.KEY_AI_MODEL, "doubao-1.5-pro-32k");

export const renderChat = (key: string) => {
  const s = Array.from(key.matchAll(/\d+/g));
  const groupId = s[0][0];
  const chatId = s[1][0];
  return {groupId, chatId};
}


export const renderGroup = (key: string) => {
  const s = Array.from(key.matchAll(/\d+/g));
  return s[0][0];

}