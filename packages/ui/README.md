# @yushuo/ui

宇硕会员体系 - UI组件库

## 安装

```bash
npm install @yushuo/ui
```

## 组件

### Toast

通知提示组件，支持成功、错误、警告、信息四种类型。

```tsx
import { Toast } from '@yushuo/ui';

function App() {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <button onClick={() => setShowToast(true)}>显示提示</button>
      {showToast && (
        <Toast
          message="操作成功"
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
```

**Props:**
- `message: string` - 提示消息
- `type?: 'success' | 'error' | 'info' | 'warning'` - 提示类型（默认 'success'）
- `duration?: number` - 显示时长（毫秒，默认 3000）
- `onClose: () => void` - 关闭回调

### ProductCard

产品卡片组件，用于展示产品信息。

```tsx
import { ProductCard } from '@yushuo/ui';
import Link from 'next/link';
import Image from 'next/image';

const product = {
  slug: 'example',
  name: '示例产品',
  description: '这是一个示例产品',
  icon: '📦',
  requiredLevel: 'monthly',
  priceType: 'membership',
  trialEnabled: true,
  trialCount: 5,
  features: ['功能1', '功能2', '功能3'],
  sortOrder: 1
};

function App() {
  return (
    <ProductCard
      product={product}
      LinkComponent={Link}
      ImageComponent={Image}
      membershipLevels={MEMBERSHIP_LEVELS}
    />
  );
}
```

**Props:**
- `product: Product` - 产品对象
- `LinkComponent?: React.ComponentType<any>` - 自定义 Link 组件（可选，默认使用 `<a>`）
- `ImageComponent?: React.ComponentType<any>` - 自定义 Image 组件（可选，默认使用 `<img>`）
- `membershipLevels?: Record<MembershipLevel, { name: string }>` - 会员等级配置（可选）

## 样式

组件使用 Tailwind CSS 类名，需要在项目中配置 Tailwind CSS。

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@yushuo/ui/**/*.{js,ts,jsx,tsx}'
  ],
  // ... 其他配置
};
```

## 类型

所有组件都提供完整的 TypeScript 类型定义。

```typescript
import type { ToastType, ToastProps, Product, ProductCardProps } from '@yushuo/ui';
```

## License

MIT
