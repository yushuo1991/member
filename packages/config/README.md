# @yushuo/config

宇硕会员体系 - 共享配置包

包含Tailwind CSS、TypeScript和ESLint的共享配置。

## 安装

```bash
npm install @yushuo/config
```

## 使用

### Tailwind CSS配置

在你的项目中扩展共享的Tailwind配置:

```js
// tailwind.config.js
const sharedConfig = require('@yushuo/config/tailwind.config.js');

module.exports = {
  ...sharedConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // 如果使用UI组件库,添加这行
    './node_modules/@yushuo/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme.extend,
      // 你的自定义扩展
    },
  },
};
```

### TypeScript配置

扩展共享的TypeScript配置:

```json
{
  "extends": "@yushuo/config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### ESLint配置

扩展共享的ESLint配置:

```js
// .eslintrc.js
module.exports = {
  extends: ['@yushuo/config/eslint.config.js'],
  // 你的自定义规则
};
```

## 包含的配置

### Tailwind主题

- **颜色系统**: primary, secondary, gray, success, warning, error
- **圆角**: xl, 2xl, 3xl
- **阴影**: card, card-hover
- **动画**: fade-in, slide-up
- **字体**: Apple系统字体栈

### TypeScript

- 目标: ES2020
- 模块: ESNext
- 严格模式: 启用
- 源映射: 启用
- 声明文件: 启用

### ESLint

- 基础: ESLint推荐 + Next.js核心Web Vitals
- 警告未使用变量
- 强制使用const
- 禁止使用var

## License

MIT
