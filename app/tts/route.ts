import {
  createRouteHandlerClient,
  createServerActionClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech";
import { Database } from "@/supabase/types";
import { redirect } from "next/navigation";
import fs from "fs";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function generateFiles(
  voices: SpeechCreateParams["voice"][],
  text: string,
) {
  "use server";

  const supabase = createRouteHandlerClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const timestamp = new Date().toISOString();
  for (const voice of voices) {
    try {
      console.log(`Generating ${voice}`);
      const response = await openai.audio.speech.create({
        // model: "tts-1",
        model: "tts-1-hd",
        voice: voice,
        input: text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      const speechFile = `tradescan_${voice.trim()}_${timestamp}.mp3`;
      const tmpPath = `/tmp/${speechFile}`;

      await fs.promises.writeFile(tmpPath, buffer);

      const url = `${user?.id}/${speechFile}`;

      const speechFileContent = fs.readFileSync(tmpPath);

      console.log("Uploading to supabase storage - ", url);
      const { data, error } = await supabase.storage
        .from(`tts`)
        .upload(url, speechFileContent);

      console.log(
        `Audio file created: ${speechFile} - [${JSON.stringify(error)}]`,
      );
    } catch (error) {
      console.error(`Error creating audio for voice ${voice}:`, error);
    }
  }
}

export async function POST(request: Request) {
  const data = await request.json();

  await generateFiles(["alloy"], data.text);

  return NextResponse.json({ success: true });
}
