import React from 'react'
import { useField } from 'formik'

type FormErrorProps = {
  name: string
  className?: string
}

export const FormErrorMessage: React.FC<FormErrorProps> = ({
  name,
  className = '',
}) => {
  const [, meta] = useField(name)

  if (!meta.touched || !meta.error) return null

  return (
    <p className={`text-[11px] text-left text-red-500 ${className}`}>
      {meta.error}
    </p>
  )
}
