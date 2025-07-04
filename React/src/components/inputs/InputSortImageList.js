import { fileRequester } from "App";
import P from "components/P/P";
import Center from "components/center/Center";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import addFolder from "resources/icons/add-folder 1.svg";
import imageIcon from "resources/icons/photo 1.svg";
import {
  compressImage,
  createImageFileFromDom,
  dataURLtoBlob,
  toast,
} from "shared/utils/Utils";
import { v4 as uuidv4 } from "uuid";
import FilePreview from "./FilePreview";
import style from "./InputImage.module.scss";
import _ from "lodash";
const InputSortImageList = forwardRef(
  (
    {
      values = [],
      maxSizeMb,
      path = "/",
      name,
      cropWidth = 70,
      cropHeight = 70,
      maxWidthOrHeight,
      linkable = false,
      placeHolder,
    },
    ref
  ) => {
    const inputRef = useRef();
    const fileChangeTargetIndex = useRef(null);
    const dragItemIndex = useRef(null);
    const dragOverItemIndex = useRef(null);
    const [hoverState, setHoverState] = useState(false);

    const [files, setFiles] = useState(
      values.map((value) => {
        if (typeof value === "string") return value;
        else return value.src;
      }) || []
    );
    const [links, setLinks] = useState(
      values.map((value) => {
        if (typeof value === "object") return value.link;
        else return "";
      }) || []
    );
    const imagesRef = useRef([]);
    const value = useRef();
    // useEffect(() => {
    //   const changed =
    //     values.map((value) => {
    //       if (typeof value === "string") return value;
    //       else return value.src;
    //     }) || [];
    //   setFiles(changed);
    // }, [values]);

    // useEffect(() => {
    //   const srcList = (values || []).map(v =>
    //     typeof v === "string" ? v : v.src
    //   );
    //   const linkList = (values || []).map(v =>
    //     typeof v === "object" ? v.link ?? "" : ""
    //   );

    //   // 이미 같은 배열이면 setState 스킵해 재렌더 루프 방지
    //   if (!_.isEqual(files, srcList)) setFiles(srcList);
    //   if (!_.isEqual(links, linkList)) setLinks(linkList);
    // }, [values]);

    const handleDragOver = (e) => {
      if ("preventDefault" in e) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (e.type === "dragover") {
        setHoverState(true);
      } else {
        setHoverState(false);
      }
    };
    const handleFileSelect = async (e) => {
      handleDragOver(e);
      let newFiles = e.target.files || e.dataTransfer.files;
      if (
        [...newFiles].some(
          (f) => !f?.type || !String(f?.type)?.includes("image")
        )
      ) {
        e.target.value = null;
        toast({
          type: "error",
          message: `이미지 파일만 업로드 가능합니다.`,
        });
        return;
      }
      for (var image of newFiles) {
        var reader = new FileReader();

        reader.onload = function (event) {
          var img = new Image();
          img.src = event.target.result;
        };

        reader.readAsDataURL(image);
      }

      newFiles = await Promise.all(
        Object.keys(newFiles).map(async (key) => {
          const file = newFiles[key];
          return await compressImage(
            file,
            file?.name,
            maxSizeMb,
            maxWidthOrHeight
          );
        })
      );
      setFiles([...files, ...newFiles]);

      e.target.value = null;
    };

    const handleDragStart = (index) => (e) => {
      dragItemIndex.current = index;
      e.dataTransfer.effectAllowed = "move";
    };
    const handleItemDragOver = (index) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragOverItemIndex.current = index;
    };

    const handleItemDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const dragFrom = dragItemIndex.current;
      const dragTo = dragOverItemIndex.current;

      if (dragFrom === null || dragTo === null || dragFrom === dragTo) {
        dragItemIndex.current = null;
        dragOverItemIndex.current = null;
        return;
      }

      const updatedFiles = [...files];
      const draggedItem = updatedFiles[dragFrom];

      updatedFiles.splice(dragFrom, 1);
      updatedFiles.splice(dragTo, 0, draggedItem);

      setFiles(updatedFiles);

      dragItemIndex.current = null;
      dragOverItemIndex.current = null;
    };

    const uploadFiles = async () => {
      const filter = files
        .map((file, index) => ({ file, index }))
        .filter((f) => f.file?.name);
      const converted = await Promise.all(
        filter.map(async (f) => {
          const preview = imagesRef.current[f.index]?.lastChild?.src;
          const isGif = preview && preview.startsWith("data:image/gif;");

          let file;
          if (isGif) {
            const jsFile = dataURLtoBlob(preview);
            const fileName = uuidv4() + ".gif";
            file = new File([jsFile], fileName, { type: "gif" });
          } else
            file = await createImageFileFromDom(imagesRef.current[f.index]);
          if (typeof file === "object") return file;
          else return null;
        })
      );
      if (converted.some((c) => !c)) return false;

      const formData = new FormData();
      converted.forEach((file) => formData.append("file", file));
      formData.append("path", path);

      let uploadResult = await fileRequester.upload(formData, path);
      value.current = files;

      uploadResult?.uploads?.forEach((upload, index) => {
        if (String(upload.url).includes("gif")) {
          const array = upload.extra || [];
          if (array.length > 0) {
            value.current[filter[index].index] = array?.[0];
          } else value.current[filter[index].index] = upload.url;
        } else value.current[filter[index].index] = upload.url;
      });

      if (linkable) {
        const origin = window.location.origin;
        value.current = value.current?.map((v, index) => ({
          src: v,
          link: links[index] ? links[index].replace(origin, "") : "",
        }));
      }

      return true;
    };
    const removeFile = (index) => {
      delete files[index];
      delete imagesRef.current[index];
      setFiles([...files.filter((f) => !!f)]);
      imagesRef.current = imagesRef.current.filter((f) => !!f);
    };
    useImperativeHandle(ref, () => ({
      getName() {
        return name;
      },
      getValue() {
        return (value.current || []).map((v) =>
          typeof v === "string" ? { src: v } : v
        );
      },
      getPreview() {
        return imagesRef.current?.map((refs) => ({
          src: refs?.lastChild?.src,
        }));
      },
      async upload(callback) {
        let result = await uploadFiles();
        callback(result);
      },
      async isValid() {
        return await uploadFiles();
      },
      focus() { },
    }));
    return (
      <div
        className={style.wrapper}
        onClick={() => inputRef?.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragOver}
        onDrop={handleFileSelect}
        style={{ position: "relative" }}
      >
        <input
          hidden
          type="file"
          multiple
          ref={inputRef}
          accept="image/gif, image/jpeg, image/png"
          onChange={handleFileSelect}
        />
        <VerticalFlex>
          <FlexChild>
            <HorizontalFlex
              gap={"20px 15px"}
              flexWrap={"wrap"}
              justifyContent={"start"}
            >
              {files?.map((file, index) => (
                <FlexChild
                  key={`${file?.name}_${index}`}
                  width={"calc(100% / 4 - 12px)"}
                >
                  <div
                    className={style.previews}
                    draggable
                    onDragStart={handleDragStart(index)}
                    onDragOver={handleItemDragOver(index)}
                    onDrop={handleItemDrop}
                  >
                    <FilePreview
                      data={file}
                      onRemove={() => removeFile(index)}
                      cropWidth={cropWidth}
                      cropHeight={cropHeight}
                      hideChange={true}
                      callback={(imageDiv) => {
                        imagesRef.current[index] = imageDiv;
                      }}
                      onCropAreaChange={() => { }}
                    />
                  </div>

                  {/* <FlexChild width={"max-content"}>
                    <VerticalFlex gap={5}>
                      <FlexChild width={"max-content"}>
                        <InputNumber
                          key={`${index}_${files?.length}`}
                          width={200}
                          value={index}
                          min={0}
                          max={files?.length - 1}
                          onChange={(i) => {
                            const temp = files[i];
                            files[i] = files[index];
                            files[index] = temp;
                            setFiles([...files]);
                          }}
                        />
                      </FlexChild>
                      {linkable && (
                        <FlexChild width={"max-content"}>
                          <Input
                            value={links[index]}
                            validable={false}
                            width={200}
                            placeHolder="링크.."
                            onChange={(value) => {
                              links[index] = value;
                              setLinks(links);
                            }}
                          />
                        </FlexChild>
                      )}
                    </VerticalFlex>
                  </FlexChild> */}
                </FlexChild>
              ))}

              {files.length > 0 && (
                <FlexChild width={"calc(100% / 4 - 12px)"}>
                  <VerticalFlex>
                    <FlexChild justifyContent={"center"}>
                      <Center
                        width={120}
                        height={120}
                        backgroundColor={"#f5f5f5"}
                        cursor={"pointer"}
                        onClick={(e) => {
                          e.stopPropagation();
                          fileChangeTargetIndex.current = null;
                          inputRef?.current.click();
                        }}
                      >
                        <P color={"#3C4B64"} weight={700} size={50}>
                          +
                        </P>
                      </Center>
                    </FlexChild>
                  </VerticalFlex>
                </FlexChild>
              )}
            </HorizontalFlex>
          </FlexChild>
          {files.length > 1 && (
            <FlexChild justifyContent={"center"}>
              <P
                color={"var(--main-color)"}
                weight={600}
                size={14}
                textAlign={"center"}
              >
                이미지를 마우스로 드래그 해 옮기면 상세페이지
                
                순서를 바꿀 수 있습니다.
              </P>
            </FlexChild>
          )}
          {files.length === 0 && (
            <VerticalFlex gap={10}>
              <FlexChild>
                <HorizontalFlex gap={10}>
                  <FlexChild justifyContent={"flex-end"}>
                    <img style={{ width: "45px" }} src={imageIcon} />
                  </FlexChild>
                  <FlexChild>
                    <img style={{ width: "45px" }} src={addFolder} />
                  </FlexChild>
                </HorizontalFlex>
              </FlexChild>
              <FlexChild justifyContent={"center"}>
                <P color={"#333333"} weight={500} size={16}>
                  상세페이지 파일을 드래그 앤 드롭해 주세요.
                </P>
              </FlexChild>
              {placeHolder && (
                <FlexChild justifyContent={"center"}>
                  <P fontSize={12} color={"#999999"}>
                    {placeHolder}
                  </P>
                </FlexChild>
              )}
              <FlexChild
                cursor={"pointer"}
                backgroundColor={"var(--main-color)"}
                width={"fit-content"}
                padding={"5px 15px"}
                borderRadius={5}
                justifyContent={"center"}
              >
                <P weight={600} size={14} color={"#ffffff"}>
                  파일 업로드
                </P>
              </FlexChild>
            </VerticalFlex>
          )}
        </VerticalFlex>
      </div>
    );
  }
);

export default InputSortImageList;
