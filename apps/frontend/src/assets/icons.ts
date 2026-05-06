const modules = import.meta.glob('../assets/*.svg', {
  eager: true,
  import: 'default',
})

const icons: Record<string, string> = {}

Object.keys(modules).forEach(path => {
  const name = path.split('/').pop()?.replace('.svg', '') || ''
  icons[name] = modules[path] as string
})

export default icons
