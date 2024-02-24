import { Heading } from '@radix-ui/themes';
import Link from 'next/link';

export default function Page() {
  return (
    <div className={'w-full h-full flex flex-col items-center gap-4 pt-8'}>
      <div className={'flex flex-col w-2/3 xl:w-1/2'}>
        <Heading size={'8'} className={'text-primary-text-contrast'}>
          Changelog
        </Heading>

        <p className={'text-primary-text'}>Stay updated with the latest changes and improvements</p>
      </div>

      <div className={'flex flex-col items-start gap-2  w-2/3 xl:w-1/2 border-t border-primary-border pt-8'}>
        <div className={'flex flex-col items-start'}>
          <Heading size={'4'} className={'text-primary-text'}>
            24th Feb 2024
          </Heading>
          <Heading size={'7'} className={'text-primary-text-contrast'}>
            Interactive Roadmap
          </Heading>
        </div>

        <video autoPlay loop muted className="">
          <source
            src="https://lmdjnapcgjqqcfbjkvbq.supabase.co/storage/v1/object/public/media/changelog-1.mp4?t=2024-02-24T06%3A08%3A58.854Z"
            type="video/mp4"
          />
        </video>

        <p>
          Check it out{' '}
          <Link href="/roadmap" className={'cursor-pointer text-accent-text hover:text-accent-text-contrast'}>
            here
          </Link>
        </p>
      </div>
    </div>
  );
}
