import { Button, Card, Heading, Text, TextFieldInput } from '@radix-ui/themes';
import { CheckIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export default function () {
  return (
    <div className={'w-full h-full flex-col flex text-primary-text-contrast overflow-auto'}>
      <div className={'mt-[5%] flex flex-col items-center'}>
        <div className={'flex flex-row gap-2 items-center'}>
          <img src={'/logo.png'} className={'h-12'} />
          <p className={'text-[50px] font-bold'}>Tradescan</p>
        </div>
        {/*<span className={'text-[30px] leading-none font-normal'}>TEST. LEARN. EARN.</span>*/}
        <p className={'text-[30px] leading-none text-primary-text'}>Master your trading craft</p>
      </div>

      <div className={'mt-5 flex flex-row gap-2 items-center justify-center'}>
        <Link href={'/login'}>
          <Button size={'3'}>Get started FREE</Button>
        </Link>
      </div>

      <div className={'mt-10 flex flex-col items-center gap-2'}>
        <p className={'text-[30px] leading-none font-bold'}>Parallel historical replay</p>
        <div className={'youtube-container w-2/3 overflow-hidden aspect-video pointer-events-none'}>
          <iframe
            className={'youtube-iframe'}
            width="560"
            height="315"
            src="https://www.youtube.com/embed/2Eu0NoR4JGA?playlist=2Eu0NoR4JGA&loop=1&autoplay=1&mute=1&controls=0&iv_load_policy=3"
            title="Parallel replay"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <div className={'mt-10 flex flex-col items-center gap-2'}>
        <p className={'text-[30px] leading-none font-bold mb-1'}>Fully extensible JavaScript</p>
        <div className={'youtube-container w-2/3 overflow-hidden aspect-video pointer-events-none'}>
          <iframe
            className={'youtube-iframe'}
            width="560"
            height="315"
            src="https://www.youtube.com/embed/Ytb-W-h1nnk?playlist=Ytb-W-h1nnk&loop=1&autoplay=1&mute=1&controls=0&iv_load_policy=3"
            title="Configuration example"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <div className={'mt-10 flex flex-col self-center'}>
        <p className={'text-[30px] leading-none font-bold mb-2'}>And more..</p>
        <div className={'flex flex-row items-center gap-2'}>
          <CheckIcon className={'h-8 text-[var(--jade-9)]'} />
          <span>Individual setup replays</span>
        </div>
        <div className={'flex flex-row items-center gap-2'}>
          <CheckIcon className={'h-8 text-[var(--jade-9)]'} />
          <span>Strategy statistics</span>
        </div>
        <div className={'flex flex-row items-center gap-2'}>
          <CheckIcon className={'h-8 text-[var(--jade-9)]'} />
          <span>Light / dark mode</span>
        </div>
        <div className={'flex flex-row items-center gap-2'}>
          <CheckIcon className={'h-8 text-[var(--jade-9)]'} />
          <span>CSV export</span>
        </div>
      </div>

      <div className={'mt-10 flex flex-col self-center'}>
        <Link href={'/login'}>
          <Button size={'3'}>Get started FREE</Button>
        </Link>
      </div>

      <div className={'invisible mt-10 h-[70px] w-full bg-primary-bg-subtle border-t-[0.5px] border-primary-border'}>
        <Button>Get started FREE</Button>
      </div>
    </div>
  );
}
