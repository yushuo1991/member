# Product Cover Images

This directory contains cover images for all products in the membership system.

## Current Images

### Existing Images (PNG format, ~600KB each)
- `bankuaizhushou-cover.png` - 板块助手封面
- `bk-cover.png` - 板块节奏系统封面
- `fupanbanmian-cover.png` - 复盘版面封面
- `fuplan-cover.png` - 复盘系统封面
- `jiandanfupan-cover.png` - 简单复盘封面
- `qingxubiaoge-cover.png` - 情绪表格封面
- `xinli-cover.png` - 心理测评系统封面
- `xuexiquan-cover.png` - 学习圈封面

### New Images (SVG format)
- `peibanying-cover.svg` - 宇硕陪伴营封面 (SVG placeholder)

## Image Specifications

### Recommended Dimensions
- **Width**: 800px
- **Height**: 450px
- **Aspect Ratio**: 16:9

### Design Guidelines
- **Format**: PNG or SVG
- **File Size**: Keep under 1MB for PNG files
- **Background**: Use gradient colors matching the product theme
- **Content**: Include product name in Chinese and relevant icon
- **Style**: Professional, clean, and modern design

## 陪伴营 Cover Image

The current `peibanying-cover.svg` is a placeholder with:
- Gold gradient background (representing premium/high-end)
- Graduation cap icon with book (representing education)
- Product name: "宇硕陪伴营"
- Subtitle: "专业交易教育 · 全程陪伴成长"
- Decorative elements (stars, circles, lines)

### To Replace with PNG
If you want to replace the SVG with a PNG image:
1. Create a PNG image with dimensions 800x450px
2. Use a gold/yellow gradient theme
3. Include the text "宇硕陪伴营" prominently
4. Add a graduation cap or education-related icon
5. Save as `peibanying-cover.png`
6. Optionally remove the SVG file

## Usage in Code

Images are referenced in the product pages using:
```typescript
<img src="/products/peibanying-cover.svg" alt="宇硕陪伴营" />
```

Or for PNG:
```typescript
<img src="/products/peibanying-cover.png" alt="宇硕陪伴营" />
```
