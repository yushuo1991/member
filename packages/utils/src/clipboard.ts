/**
 * 复制文本到剪贴板的工具函数
 * 支持现代浏览器的 Clipboard API 和降级方案
 */

/**
 * 使用 Clipboard API 复制文本（现代浏览器）
 */
async function copyWithClipboardAPI(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not supported');
  }
  await navigator.clipboard.writeText(text);
}

/**
 * 使用 document.execCommand 复制文本（降级方案）
 */
function copyWithExecCommand(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.top = '0';
  textarea.style.left = '0';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    document.body.removeChild(textarea);
    return false;
  }
}

/**
 * 复制文本到剪贴板
 * 自动选择最佳方法（Clipboard API 或 execCommand 降级）
 *
 * @param text - 要复制的文本
 * @returns Promise<boolean> - 是否成功复制
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 检查是否为 HTTPS 或 localhost（Clipboard API 要求）
  const isSecureContext = window.isSecureContext;

  // 优先使用 Clipboard API（仅在安全上下文中可用）
  if (isSecureContext && navigator.clipboard) {
    try {
      await copyWithClipboardAPI(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, falling back to execCommand:', err);
      // 如果 Clipboard API 失败，降级到 execCommand
      return copyWithExecCommand(text);
    }
  }

  // 降级方案：使用 document.execCommand
  return copyWithExecCommand(text);
}

/**
 * 检查剪贴板功能是否可用
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard || document.queryCommandSupported?.('copy'));
}
