'use client';

import {
  ChatBubbleIcon,
  DashboardIcon,
  ExitIcon,
  HamburgerMenuIcon,
  LockClosedIcon,
  PlusIcon,
  RocketIcon,
} from '@radix-ui/react-icons';
import { IconButton, Popover } from '@radix-ui/themes';
import Link from 'next/link';
// import { logoutAction } from "@/app/actions/auth-test/logout";
import React from 'react';
import { logoutAction } from '@/app/actions/logout-action';

export const NavDropdown = ({ headerSlot }: { headerSlot: React.ReactNode }) => {
  const menuItems = [
    // {
    //   title: 'Products',
    //   icon: <DashboardIcon />,
    //   url: '/products',
    // },
    // {
    //   title: 'My Products',
    //   icon: <RocketIcon />,
    //   url: '/my-products',
    // },
    // {
    //   title: 'My Reviews',
    //   icon: <ChatBubbleIcon />,
    //   url: '/my-reviews',
    // },
    // {
    //   title: 'Add Product',
    //   icon: <PlusIcon />,
    //   url: '/product/upload',
    // },
    {
      title: 'Privacy',
      icon: <LockClosedIcon />,
      url: '/privacy',
    },
    // ... add more items as needed
  ];

  return (
    <>
      <Popover.Root>
        <Popover.Trigger className={'inline-flex'}>
          <HamburgerMenuIcon className="h-6 w-6 cursor-pointer text-accent-text hover:text-accent-text-contrast duration-200 transition-all" />
        </Popover.Trigger>
        <Popover.Content className={'w-[250px]'} style={{ padding: 8 }} align="end" sideOffset={15} alignOffset={-5}>
          <div>{headerSlot}</div>

          {menuItems.map(item => (
            <div
              className={
                'flex flex-row items-center gap-3 hover:bg-primary-bg-hover duration-200 transition-all p-2 rounded'
              }
              key={item.title}
            >
              <span className={'text-xs'}>{item.icon}</span>
              <Link href={item.url}>{item.title}</Link>
            </div>
          ))}

          <div
            className={
              'flex flex-row items-center cursor-pointer gap-3 hover:bg-primary-bg-hover duration-200 transition-all p-2 rounded'
            }
            onClick={async () => {
              await logoutAction();
            }}
          >
            <ExitIcon></ExitIcon>
            <p>{'Log out'}</p>
          </div>
        </Popover.Content>
      </Popover.Root>
    </>
  );
};
