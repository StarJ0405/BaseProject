"use client";

import Button from "@/components/buttons/Button";
import FlexChild from "@/components/flex/FlexChild";
import VerticalFlex from "@/components/flex/VerticalFlex";
import Input from "@/components/inputs/Input";
import P from "@/components/P/P";
import useNavigate from "@/shared/hooks/useNavigate";
import { requester } from "@/shared/Requester";
import { Cookies } from "@/shared/utils/Data";
import { getCookieOption } from "@/shared/utils/Functions";
import { useState } from "react";
import { useCookies } from "react-cookie";

export default function () {
  const [, setCookies] = useCookies();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigator = useNavigate();
  return (
    <VerticalFlex>
      <FlexChild>
        <P>ID</P>
        <Input onChange={(value) => setId(String(value))} />
      </FlexChild>
      <FlexChild>
        <P>password</P>
        <Input
          type="password"
          onChange={(value) => setPassword(String(value))}
        />
      </FlexChild>
      <Button
        onClick={() => {
          requester.login(
            { user_name: id, password },
            ({ access_token }: { access_token: string }) => {
              if (access_token) {
                setCookies(Cookies.JWT, access_token, getCookieOption());
              }
            }
          );
        }}
      >
        login
      </Button>
      <Button onClick={() => navigator("/login/test")}>move</Button>
    </VerticalFlex>
  );
}
