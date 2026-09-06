import { reactive, readonly } from "vue";
const message = reactive({ texte: "", type: "success" });
export const notification = readonly(message);
export function notifier(texte, type = "success") {
  Object.assign(message, { texte, type });
}
export function effacerNotification() {
  message.texte = "";
}
