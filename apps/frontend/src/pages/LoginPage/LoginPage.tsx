import logoWithText from '../../assets/logo-with-text.svg'
import logo from '../../assets/logo.svg'
import womenWalks from '../../assets/women-walks.svg'
import worldMap from '../../assets/world-map-with-logo.svg'
import { LoginForm } from '../../components'

export const LoginPage: React.FC = () => {
  return (
    <div className='w-full flex flex-col min-h-screen w-full md:grid md:grid-cols-12 '>
      <div className='w-full flex flex-col items-start col-span-7 pt-[20px] md:pt-[68px] pl-[18px]  md:pl-[58px] relative'>
        <div className='flex justify-start w-full'>
          <img src={logoWithText} alt='logo' className='max-w-full h-auto' />
        </div>
        <div className='w-full h-[350px]'>
          <p className='text-[#292929] text-left text-[30px] md:text-[98px] leading-[32px] md:leading-[113px] font-light pt-5 md:pt-36'>
            Unlock your
            <br />
            heritage
          </p>
        </div>
        <img
          src={womenWalks}
          alt='Women walks'
          className='absolute bottom-[-3px] left-20'
        />
        <img
          src={worldMap}
          alt='World map with logo'
          className='absolute bottom-0 right-45 md:right-8 bottom-20'
        />
      </div>
      <div className='bg-[#EAEAEA] p-5 pt-20 md:p-0 flex items-center justify-center col-span-5 shadow-[2px_0_12px_rgba(0,0,0,0.15)] relative'>
        <div className='md:p-8 lg:p-23 rounded-lg w-full'>
          <LoginForm />
          <div className='absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 items-center'>
            <img src={logo} alt='logo small' className='w-1/6' />
            <p>Open-source annotation tool</p>
          </div>
        </div>
      </div>
    </div>
  )
}
