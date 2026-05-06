import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { InputField, Button } from '@shared/ui'
import { useSignIn } from '../../query'
import { type AuthRequestDto } from '../../api'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'

interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
}

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
})

export const LoginForm = () => {
  const navigate = useNavigate()

  const signInMutation = useSignIn({
    onSuccess: _data => {
      navigate('/')
    },
    onError: error => {
      console.error('Login failed:', error.message)
      toast.error('Invalid email or password')
    },
  })

  const handleSubmit = async (values: AuthRequestDto) => {
    const payload: AuthRequestDto = {
      email: values.email,
      password: values.password,
    }
    await signInMutation.mutateAsync(payload)
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, errors }) => (
        <Form className='flex flex-col gap-4 w-full h-[400px]'>
          <Field
            name='email'
            as={InputField}
            label='Email/Username'
            type='email'
            errorText={errors.email}
          />
          <Field
            name='password'
            as={InputField}
            label='Password'
            type='password'
            errorText={errors.password}
          />
          <div className='flex items-center justify-between p-4'>
            <label className='flex items-center gap-2 cursor-pointer text-[#292929] text-[14px]'>
              <input
                type='checkbox'
                name='remember_me'
                checked={values.rememberMe}
                onChange={() => {
                  setFieldValue('rememberMe', !values.rememberMe).then(r =>
                    console.log(r)
                  )
                }}
              />
              Remember me
            </label>
            <p className='hover:underline text-sm text-[#292929] cursor-pointer '>
              Forgot Password?
            </p>
          </div>

          <Button
            type='submit'
            variant='contained'
            color='secondary'
            sx={{ borderRadius: '40px', background: '#DFDFDF' }}
          >
            Sign In
          </Button>
        </Form>
      )}
    </Formik>
  )
}
