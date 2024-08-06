'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from '@radix-ui/themes';

export default function Messages() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  const message = searchParams?.get('message');
  return (
    <div className="mt-5">
      {error ||
        (message && (
          <Card variant={'surface'}>
            {error && <p className="text-[var(--tomato-11)]">{error}</p>}
            {message && <p className="">{message}</p>}

            {message == 'Could not authenticate user' && (
              <div className={'flex flex-col items-start mt-3'}>
                <p className="">You'll need to either:</p>
                <p className="">&bull; Log in instead of sign up</p>
                <p className="">&bull; Verify your email if you've already signed up</p>
                <p className="text-sm italic">
                  &nbsp;&nbsp;&nbsp;&nbsp;&bull; Signup again to resend verification email
                </p>
              </div>
            )}
          </Card>
        ))}
    </div>
  );
}
