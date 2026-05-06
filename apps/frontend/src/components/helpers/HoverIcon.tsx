import React, { useState } from 'react'
import icons from '../../assets/icons'

type IconName = keyof typeof icons
type Props = {
  name: IconName
  alt?: string
} & React.ImgHTMLAttributes<HTMLImageElement>

const HoverIcon = ({ name, alt, ...props }: Props) => {
  const [isHovered, setIsHovered] = useState(false)

  const defaultSrc = icons[name]
  const hoverSrc = icons[`${name}-hover`]

  const src = isHovered && hoverSrc ? hoverSrc : defaultSrc

  return (
    <img
      src={src}
      alt={alt || name}
      onMouseEnter={() => hoverSrc && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  )
}

export default HoverIcon
