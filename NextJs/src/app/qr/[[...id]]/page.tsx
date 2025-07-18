import Center from "@/components/center/Center";
import Div from "@/components/div/Div";
import P from "@/components/P/P";

export default async function () {
  // return <div style={{
  //   display:'flex',
  //   justifyContent
  // }}> qr 서브도메인을 통해 접속하셨군요</div>;
  return (
    <Center>
      <P>해당 기능은 어플 혹은 홈페이지의 스캔 기능을 통해서만 작동합니다!</P>

      <a
        style={{
          padding: 10,
          border: "1px solid #dadada",
          margin: 10,
        }}
        href={"https://appdown.puffuapp.com"}
      >
        앱 다운로드 링크!
      </a>
    </Center>
  );
}
