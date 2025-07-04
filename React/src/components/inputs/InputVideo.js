import { fileRequester } from "App";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import Icon from "components/icons/Icon";
import P from "components/P/P";
import HLSPlayer from "components/video/HLSPlayer";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import addFolder from "resources/icons/add-folder 1.svg";
import youtubeIcon from "resources/icons/youtube_2504965 1.svg";

const InputVideo = forwardRef((props, ref) => {
  // const [url, setUrl] = useState();
  const value = useRef();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(
    "비디오 파일을 드래그 앤 드롭하거나 클릭하여 선택"
  );
  const [previewUrl, setPreviewUrl] = useState(props.url);
  const dropAreaRef = useRef(null);
  const inputRef = useRef(null);
  const [originalFileName, setOriginalFileName] = useState(""); // 기존 파일명 저장

  useEffect(() => {
    if (props.url) {
      // URL에서 파일명을 추출하여 저장 (예: "https://example.com/uploads/video.mp4" → "video.mp4")
      const urlParts = props.url.split("/");
      const extractedFileName = urlParts[urlParts.length - 1];
      setOriginalFileName(extractedFileName);
      setFileName(extractedFileName);
      value.current = props.url;
    }
  }, [props.url]);

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      // 선택한 파일명이 기존 파일명과 다를 경우에만 업로드 진행
      if (selectedFile.name !== originalFileName) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        alert("같은 파일입니다. 업로드를 건너뜁니다.");
      }
    } else {
      alert("비디오 파일만 업로드 가능합니다.");
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropAreaRef.current.style.border = "2px dashed blue";
  };

  const handleDragLeave = () => {
    dropAreaRef.current.style.border = "2px dashed gray";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropAreaRef.current.style.border = "2px dashed gray";
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // 업로드 버튼 클릭 시 실행
  const handleUpload = async () => {
    if (!file) {
      return;
    }

    // 기존 파일과 같은 경우 업로드 중단
    if (file.name === originalFileName) {
      return;
    }

    // FormData 생성
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", props.path);

    // 업로드 API가 존재하면 호출
    try {
      const response = await fileRequester.upload(formData, props.path);

      if (response.uploads && response.uploads.length > 0) {
        const uploadedUrl = response.uploads[0].url;
        value.current = uploadedUrl;
        setFileName(uploadedUrl.split("/").pop());
        setOriginalFileName(uploadedUrl.split("/").pop());

        // ✅ 파일 상태 초기화
        setFile(null);

        if (inputRef.current) {
          inputRef.current.value = "";
          inputRef.current.files = null;
        }
        return true;
      }
    } catch (error) {
      console.error("업로드 실패:", error);
    }
  };

  useImperativeHandle(ref, () => ({
    getFile() {
      return file;
    },
    async upload(callback) {
      let result = await handleUpload();
      callback(result);
    },
    async isValid() {
      return await handleUpload();
    },
    getValue() {
      return value.current;
    },
    getPreview() {
      return previewUrl;
    },
  }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
        position: "relative",
      }}
    >
      {(file || previewUrl) && (
        <button
          style={{
            top: 0,
            right: 0,
            position: "absolute",
            zIndex: 1,
            backgroundColor: "unset",
            border: "unset",
            padding: 10,
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (file) {
              setFile(null);
              if (props.url) {
                const urlParts = props.url.split("/");
                const extractedFileName = urlParts[urlParts.length - 1];
                setOriginalFileName(extractedFileName);
                setFileName(extractedFileName);
                value.current = props.url;
                setPreviewUrl(props.url);
              } else setPreviewUrl(null);
            } else if (previewUrl) {
              setPreviewUrl(null);
              value.current = null;
            }
          }}
        >
          <Icon name={"closeBtn2x"} width={40} />
        </button>
      )}
      {/* 드래그 앤 드롭 영역 */}
      <div
        ref={dropAreaRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: "100%",
          // height: props.height || "200px",
          display: "flex",
          border: "1px solid #CECECE",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          cursor: "pointer",
          padding: "20px",
        }}
        onClick={() => inputRef.current.click()} // 클릭하면 파일 선택 창 열기
      >
        {/* <p>{fileName || "비디오 파일을 드래그 앤 드롭하거나 클릭하여 선택"}</p> */}
        {previewUrl ? (
          file ? (
            <video
              src={previewUrl}
              height={props.height || "150px"}
              width={"100%"}
              autoPlay
              muted
            />
          ) : (
            <HLSPlayer
              height={props.height || "150px"}
              width={"100%"}
              src={previewUrl}
            />
          )
        ) : (
          <VerticalFlex gap={10}>
            <FlexChild>
              <HorizontalFlex gap={10}>
                <FlexChild justifyContent={"flex-end"}>
                  <img style={{ width: "45px" }} src={youtubeIcon} />
                </FlexChild>
                <FlexChild>
                  <img style={{ width: "45px" }} src={addFolder} />
                </FlexChild>
              </HorizontalFlex>
            </FlexChild>
            <FlexChild justifyContent={"center"}>
              <P color={"#333333"} weight={500} size={16}>
                비디오 파일을 드래그 앤 드롭해주세요{" "}
              </P>
            </FlexChild>
            {props.placeHolder && (
              <FlexChild justifyContent={"center"}>
                <P color={"#999999"} fontSize={12}>
                  {props.placeHolder}
                </P>
              </FlexChild>
            )}
            <FlexChild
              backgroundColor={"var(--main-color)"}
              width={"fit-content"}
              padding={"5px 15px"}
              borderRadius={5}
              justifyContent={"center"}
            >
              <P weight={500} size={14} color={"#ffffff"}>
                파일 업로드
              </P>
            </FlexChild>
          </VerticalFlex>
        )}
      </div>

      {/* 숨겨진 파일 선택 input */}
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
      />

      {/* 선택된 파일명 표시 */}
      {/* <p>파일명: {fileName}</p> */}

      {/* 파일 선택 버튼 */}
      {/* <button
        onClick={() => inputRef.current.click()}
        style={{
          padding: "8px 16px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      >
        파일 선택
      </button> */}

      {/* 업로드 버튼 */}
      {/* <button
        onClick={handleUpload}
        style={{
          padding: "8px 16px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "5px",
          border: "none",
        }}
      >
        업로드
      </button> */}
    </div>
  );
});

export default InputVideo;
