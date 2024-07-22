'use client';

import { Button, Card, Heading, TextField } from '@radix-ui/themes';
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Toast } from '@/shared/toast';
import { getLogger } from '@/utils/logging/logger';

export default function Page() {
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  const logger = getLogger('password update page');

  return (
    <div className={'flex-auto flex justify-center items-center transform mt-[-50px] p-3'}>
      <Card>
        <div className={'flex flex-col gap-3 p-3'}>
          <Heading>Update Password</Heading>

          <TextField.Root
            id={'password'}
            value={password}
            minLength={8}
            onChange={e => setPassword(e.currentTarget.value)}
            placeholder={'New password'}
          ></TextField.Root>

          <Toast title="Password successfully updated">
            <Button
              className={'mt-2'}
              onClick={async () => {
                try {
                  const supabase = createClientComponentClient();

                  await supabase.auth.updateUser({ password });

                  logger.error('Password successfully updated');

                  router.push('/dashboard');
                } catch (err) {
                  logger.error('Password update failed', { ...(err || {}) });
                }
              }}
            >
              Update
            </Button>
          </Toast>
        </div>
      </Card>
    </div>
  );
}
