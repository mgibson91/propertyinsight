'use client';

import { IconButton, TextField } from '@radix-ui/themes';
import React from 'react';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';

export function PasswordField({ name }: { name: string }) {
  const [visible, setVisible] = React.useState(false);

  const Icon = visible ? EyeClosedIcon : EyeOpenIcon;

  return (
    <TextField.Root
      name={name}
      type={visible ? 'text' : 'password'}
      placeholder="Password"
      required={true}
      minLength={8}
      size="3"
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}
    >
      <TextField.Slot pr="3" side={'right'}>
        <IconButton
          size="2"
          variant="ghost"
          onClick={e => {
            setVisible(!visible);
            e.preventDefault();
          }}
        >
          <Icon height="16" width="16" />
        </IconButton>
      </TextField.Slot>
    </TextField.Root>
  );
}
