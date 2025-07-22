"use client";

import Button from "@/components/buttons/Button";
import CheckboxChild from "@/components/choice/checkbox/CheckboxChild";
import CheckboxGroup from "@/components/choice/checkbox/CheckboxGroup";
import FlexChild from "@/components/flex/FlexChild";
import HorizontalFlex from "@/components/flex/HorizontalFlex";
import VerticalFlex from "@/components/flex/VerticalFlex";
import Input from "@/components/inputs/Input";
import P from "@/components/P/P";
import useNavigate from "@/shared/hooks/useNavigate";
import { requester } from "@/shared/Requester";
import { Cookies } from "@/shared/utils/Data";
import { getCookieOption, toast } from "@/shared/utils/Functions";
import { useState } from "react";
import { useCookies } from "react-cookie";

export default function ({ pre_id }: { pre_id?: string }) {
  const [, setCookies] = useCookies();
  const [id, setId] = useState(pre_id || "");
  const [password, setPassword] = useState("");
  const [checkList, setCheckList] = useState<any[]>([]);
  const navigator = useNavigate();
  return (
    <CheckboxGroup name="login" onChange={(values) => setCheckList(values)}>
      <VerticalFlex>
        <FlexChild>
          <P>로그인</P>
        </FlexChild>
        <FlexChild>
          <Input
            value={id}
            onChange={(value) => setId(String(value))}
            placeHolder="아이디를 입력해주세요"
          />
        </FlexChild>
        <FlexChild>
          <Input
            type="password"
            onChange={(value) => setPassword(String(value))}
            placeHolder="비밀번호를 입력해주세요"
            onKeyDown={(e) => {
              console.log(e.key === "Enter");
              if (e.key === "Enter") document.getElementById("login")?.click();
            }}
          />
        </FlexChild>
        <FlexChild>
          <HorizontalFlex>
            <FlexChild>
              <CheckboxChild id="auto" />
              <P>자동 로그인</P>
            </FlexChild>
            <FlexChild>
              <CheckboxChild id="id" />
              <P>아이디 저장</P>
            </FlexChild>
          </HorizontalFlex>
        </FlexChild>
        <FlexChild>
          <Button
            id="login"
            onClick={() => {
              requester.login(
                { username: id, password, keep: checkList.includes("auto") },
                ({
                  access_token,
                  error,
                }: {
                  access_token: string;
                  error?: string;
                }) => {
                  if (access_token) {
                    setCookies(Cookies.JWT, access_token, getCookieOption());
                  } else if (error) toast({ message: error });
                }
              );
            }}
          >
            login
          </Button>
        </FlexChild>
      </VerticalFlex>
    </CheckboxGroup>
  );
}
