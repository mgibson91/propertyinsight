'use client';

import { Button, Heading, IconButton, Text } from '@radix-ui/themes';
import { usePathname, useRouter } from 'next/navigation';
import { useDisplayMode } from '@/app/display-mode-aware-radix-theme-provider';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import cx from 'classnames';

export const NavBar = ({ isLoggedIn, rightSlot }: { isLoggedIn: boolean; rightSlot?: React.ReactNode }) => {
  const router = useRouter();
  const [displayMode, setDisplayMode] = useDisplayMode();
  const pathName = usePathname();

  const path = pathName.substring(pathName.indexOf('/'));

  const Icon = displayMode.mode === 'dark' ? SunIcon : MoonIcon;

  return (
    <div
      className={
        'h-[50px] flex flex-row px-5 py-2 items-center bg-primary-bg-subtle border-b-[0.5px] border-primary-border'
      }
    >
      <div
        className={'cursor-pointer flex flex-row gap-2 items-center'}
        onClick={() => {
          router.push('/');
        }}
      >
        <img src={'/tradescan-logo.png'} className={'h-8'} />
        <Heading size={'6'} className={'text-primary-text-contrast hover:text-accent-text transform-all duration-200'}>
          Tradescan
        </Heading>
      </div>

      {isLoggedIn && (
        <div className={'flex flex-row items-center ml-10 gap-5'}>
          <Link href={'/dashboard'}>
            <Text
              size={'5'}
              className={cx(
                'hover:text-accent-text transform-all duration-200',
                path === '/dashboard' ? 'text-accent-text' : 'text-primary-text-contrast'
              )}
            >
              Dashboard
            </Text>
          </Link>

          <Link href={'/setups'}>
            <Text
              size={'5'}
              className={cx(
                'hover:text-accent-text transform-all duration-200',
                path === '/setups' ? 'text-accent-text' : 'text-primary-text-contrast'
              )}
            >
              Historical Setups
            </Text>
          </Link>

          <Link href={'/setups/replay'}>
            <Text
              size={'5'}
              className={cx(
                'hover:text-accent-text transform-all duration-200',
                path.includes('/setups/replay') ? 'text-accent-text' : 'text-primary-text-contrast'
              )}
            >
              Replay
            </Text>
          </Link>
        </div>
      )}

      <div className={'flex-1'}></div>

      <IconButton
        size={'1'}
        className={'!bg-primary-text-contrast'}
        onClick={() => {
          setDisplayMode({ mode: displayMode.mode === 'dark' ? 'light' : 'dark' });
        }}
      >
        <Icon className={displayMode.mode === 'dark' ? 'text-accent-solid' : 'text-accent-solid'} />
      </IconButton>

      {isLoggedIn && rightSlot}
      {!isLoggedIn && (
        <div className={'ml-3'}>
          <Link href={'/login'}>
            <Button size={'2'}>Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
