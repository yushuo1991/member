import SystemAccessFrame from '@/components/SystemAccessFrame'

export default function FuplanPage() {
  return (
    <SystemAccessFrame
      productSlug="fuplan"
      title="复盘系统"
      iframeSrc="/systems/fuplan-legacy/index.html?start=section1&unlock=1"
    />
  )
}

