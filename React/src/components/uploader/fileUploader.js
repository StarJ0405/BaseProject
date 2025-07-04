import { CSpinner } from "@coreui/react";
import { fileRequester } from "App";
import Center from "components/center/Center";
import Div from "components/div/Div";
import Icon from "components/icons/Icon";
import P from "components/P/P";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const FileUploader = ({
  width,
  height,
  path = "/",
  fontSize,
  compress,
  callback = () => {},
}) => {
  const [load, setLoad] = useState(false);
  const onDrop = useCallback((files) => {
    setLoad(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    fileRequester
      .upload(formData, `/${path}`.replaceAll("//", "/"), compress)
      .then((res) => {
        setLoad(false);
        callback(res?.uploads);
      });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const w = width || height || 100;
  const h = height || width || 100;
  return (
    <div
      {...getRootProps()}
      style={{ width: w, height: h, border: "1px solid black" }}
    >
      <input {...getInputProps()} />
      <Div height={"100%"} cursor={!load && !isDragActive}>
        {load ? (
          <CSpinner />
        ) : isDragActive ? (
          <Center>
            <P fontSize={fontSize}>이미지를 여기에 드롭하세요</P>
          </Center>
        ) : (
          <Icon name="plus" />
        )}
      </Div>
    </div>
  );
};

export default FileUploader;
