'use client';

import { Button, Heading, IconButton } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useDisplayMode } from "@/app/display-mode-aware-radix-theme-provider";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export const NavBar = ({ rightSlot }: { rightSlot?: React.ReactNode }) => {
  const router = useRouter();
  const [displayMode, setDisplayMode] = useDisplayMode();

  const Icon = displayMode.mode === 'dark' ? SunIcon : MoonIcon;

    return <div className={"h-[50px] flex flex-row px-5 py-2 items-center justify-between bg-primary-bg-subtle border-b-[0.5px] border-primary-border"}>
      <div className={'cursor-pointer flex flex-row gap-2 items-center'} onClick={() => {
        router.push("/")
      }}>
        <img src={"/tradescan-logo.png"} className={"h-8"}/>
        <Heading size={'6'}>Tradescan</Heading>
      </div>

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