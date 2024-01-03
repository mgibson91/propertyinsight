"use client";

import { Button, Card, Heading, TextField } from "@radix-ui/themes";
import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getLogger } from "@/utils/logging/logger";
import { Toast } from "@/shared/toast";

export default function Page() {
  const [email, setEmail] = useState<string>("");

  const logger = getLogger("password reset page");

  return (
    <div
      className={
        "flex-auto flex justify-center items-center transform mt-[-50px] p-3"
      }
    >
      <Card>
        <div className={"flex flex-col gap-3 p-3"}>
          <Heading>Reset Password</Heading>

          <TextField.Input
            id={"email"}
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder={"Email address"}
          ></TextField.Input>

          <p>If email address exists, you will receive a password reset link</p>

          <Toast title="Password reset requested">
            <Button
              className={"mt-2"}
              onClick={async () => {
                try {
                  const supabase = createClientComponentClient();
                  await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.host}/password/update`,
                  });

                  logger.error("Password reset requested");
                } catch (err) {
                  logger.error("Password reset request failed", {
                    ...(err || {}),
                    email,
                  });
                }
              }}
            >
              Reset
            </Button>
          </Toast>
        </div>
      </Card>
    </div>
  );
}
