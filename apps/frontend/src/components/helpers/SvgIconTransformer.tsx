import React from 'react'

type MuiSvgFromFileProps = {
  src: string
  size?: number
  color?: string
  className?: string
  onClick?: () => void
}

// component used to change color of hardcoded svg
export const SvgIconTransformer = ({
  src,
  size = 20,
  color = 'red',
  className,
  onClick,
}: MuiSvgFromFileProps) => {
  const [svgContent, setSvgContent] = React.useState<string>('')

  React.useEffect(() => {
    fetch(src)
      .then(res => res.text())
      .then(svg => {
        const newSvg = svg
          .replace(/fill=['"](?!none).*?['"]/gi, `fill="${color}"`)
          .replace(/stroke=['"](?!none).*?['"]/gi, `stroke="${color}"`)
        setSvgContent(newSvg)
      })
  }, [src, color])

  return (
    <span
      className={className}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        width: size,
        height: size,
        color: `${color} !important`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
