'use client';

import { Button, Heading, IconButton } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useDisplayMode } from "@/app/display-mode-aware-radix-theme-provider";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export const NavBar = ({ rightSlot }: { rightSlot?: React.ReactNode }) => {
  const router = useRouter();
  const [displayMode, setDisplayMode] = useDisplayMode();

  const Icon = displayMode.mode === 'dark' ? SunIcon : MoonIcon;

    return <div className={"h-[50px] flex flex-row px-5 py-2 items-center bg-primary-bg-subtle border-b-[0.5px] border-primary-border"}>
      <div className={'cursor-pointer flex flex-row gap-2 items-center'} onClick={() => {
        router.push("/")
      }}>
        <img src={"/tradescan-logo.png"} className={"h-8"}/>
        <Heading size={'6'} className={'text-primary-text-contrast hover:text-accent-text transform-all duration-200'}>Tradescan</Heading>
      </div>

      <div className={'flex flex-row ml-10 gap-3'}>
        <Link href={'/snapshots'}>
          <Heading size={'5'} className={'text-primary-text-contrast hover:text-accent-text transform-all duration-200'}>Snapshots</Heading>
        </Link>

        <Link href={'/snapshots/replay'}>
          <Heading size={'5'} className={'text-primary-text-contrast hover:text-accent-text transform-all duration-200'}>Replay</Heading>
        </Link>
      </div>

      <div className={'flex-1'}></div>

      <IconButton  className={'!bg-primary-text-contrast'} onClick={() => {
        setDisplayMode({ mode: displayMode.mode === "dark" ? "light" : "dark" })
      }}>
        <Icon className={displayMode.mode === "dark" ? "text-accent-solid" : "text-accent-solid"}/>
      </IconButton>

      {/*<Button onClick={() => {*/}
      {/*  setDisplayMode({ mode: displayMode.mode === "dark" ? "light" : "dark" })*/}
      {/*}}>Toggle</Button>*/}
    </div>;
}