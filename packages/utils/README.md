# @yushuo/utils

宇硕会员体系 - 工具函数库

## 安装

```bash
npm install @yushuo/utils
```

## 功能模块

- 剪贴板操作
- 数据验证
- 格式化工具
- 字符串处理

## 使用示例

### 剪贴板工具

```typescript
import { copyToClipboard, isClipboardSupported } from '@yushuo/utils';

// 复制文本到剪贴板
const success = await copyToClipboard('要复制的文本');
if (success) {
  console.log('复制成功');
}

// 检查剪贴板功能是否可用
if (isClipboardSupported()) {
  console.log('剪贴板功能可用');
}
```

### 验证工具

```typescript
import {
  isValidEmail,
  isValidPhone,
  checkPasswordStrength,
  isValidUsername
} from '@yushuo/utils';

// 验证邮箱
const emailValid = isValidEmail('user@example.com'); // true

// 验证手机号（中国大陆）
const phoneValid = isValidPhone('13800138000'); // true

// 检查密码强度 (0: 弱, 1: 中, 2: 强)
const strength = checkPasswordStrength('MyPassword123!'); // 2

// 验证用户名（4-20位字母数字下划线）
const usernameValid = isValidUsername('user_123'); // true
```

### 格式化工具

```typescript
import {
  formatPrice,
  truncate,
  randomString,
  maskPhone,
  maskEmail
} from '@yushuo/utils';

// 格式化价格
const price = formatPrice(99.99); // "¥99.99"
const priceUSD = formatPrice(99.99, '$'); // "$99.99"

// 截断文本
const text = truncate('这是一段很长的文本', 10); // "这是一段很长..."

// 生成随机字符串
const random = randomString(16); // "a3Bk9Xz7Qw2Pn5Ls"

// 脱敏手机号
const phone = maskPhone('13800138000'); // "138****8000"

// 脱敏邮箱
const email = maskEmail('user@example.com'); // "use***@example.com"
```

## API参考

### 剪贴板

**copyToClipboard(text: string): Promise<boolean>**
- 复制文本到剪贴板
- 自动选择最佳方法（Clipboard API 或 execCommand）
- 返回是否成功复制

**isClipboardSupported(): boolean**
- 检查剪贴板功能是否可用

### 验证

**isValidEmail(email: string): boolean**
- 验证邮箱格式

**isValidPhone(phone: string): boolean**
- 验证手机号格式（中国大陆）

**checkPasswordStrength(password: string): number**
- 检查密码强度
- 返回: 0 (弱), 1 (中), 2 (强)

**isValidUsername(username: string): boolean**
- 验证用户名格式（4-20位字母数字下划线）

### 格式化

**formatPrice(price: number, currency?: string): string**
- 格式化价格
- `currency` 默认为 '¥'

**truncate(text: string, maxLength: number, ellipsis?: string): string**
- 截断文本
- `ellipsis` 默认为 '...'

**randomString(length: number): string**
- 生成指定长度的随机字符串

**maskPhone(phone: string): string**
- 脱敏手机号（隐藏中间4位）

**maskEmail(email: string): string**
- 脱敏邮箱（隐藏部分用户名）

## 浏览器兼容性

- **剪贴板功能**: 需要HTTPS环境或localhost（Clipboard API要求）
- **其他功能**: 支持所有现代浏览器

## License

MIT
