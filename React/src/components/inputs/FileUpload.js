import { useEffect, useRef, useState } from "react";
import style from "./InputImage.module.scss";

import clsx from "classnames";

import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import P from "components/P/P";
import { compressImage } from "shared/utils/Utils";
import FilePreview from "./FilePreview";

import addFolder from "resources/icons/add-folder 1.svg";
import imageIcon from "resources/icons/photo 1.svg";

function FileUpload(props) {
  const [file, setFile] = useState();
  const [fileName, setFileName] = useState();
  const [hoverState, setHoverState] = useState(false);
  const inputRef = useRef();
  const [src, setSrc] = useState();
  const [colors, setColors] = useState([]);
  const [isWide, setWide] = useState();

  useEffect(() => {
    setFile(props.value);
  }, [props.value]);

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
  const handleFileSelect = (e) => {
    handleDragOver(e);
    const files = e.target.files || e.dataTransfer.files;

    for (var image of files) {
      var reader = new FileReader();

      reader.onload = function (event) {
        setSrc(event.target.result);

        var img = new Image();
        img.src = event.target.result;

        img.onload = function () {
          var w = this.width;
          var h = this.height;
          setWide(w > h);
        };
      };

      reader.readAsDataURL(image);
    }

    Object.keys(files).forEach((file) => {
      const temp = files[file];
      let fileName = files[file].name;
      compressImage(
        files[file],
        fileName,
        props.maxSizeMb,
        props.maxWidthOrHeight
      ).then((result) => {
        e.target.value = null;
        setFile(result);
      });
    });
  };

  const removeFile = () => {
    setFile(null);
  };

  const selectFile = (e) => {
    e.preventDefault();
    inputRef.current.click(e);
  };

  const getColors = (colors) => {
    setColors(colors);
  };

  useEffect(() => {
    if (file) {
      if (file.name) {
        setFileName(file.name);
      } else {
        setFileName(file);
      }
    } else {
      setFileName("이미지 파일을 드래그 앤 드롭하거나 클릭하여 선택");
      <HorizontalFlex>
        <FlexChild>
          <P>test</P>
        </FlexChild>
      </HorizontalFlex>;
    }
    props.onChange(file);
  }, [file]);

  useEffect(() => {
    props.onChangeColors(colors);
  }, [colors]);

  return (
    <>
      {/* {
                src ?
                    <ColorExtractor src={src} getColors={getColors} />
                    : null
            } */}

      <HorizontalFlex>
        {props.label && props.labelWidth && (
          <FlexChild width={props.labelWidth}>
            <input
              type="hidden"
              name={`${props.name}:maxSize`}
              value={props.maxSize}
            />
            <span>{props.label}</span>
          </FlexChild>
        )}

        <FlexChild>
          <VerticalFlex>
            <FlexChild>
              <label className={style.label}>
                <div
                  className={clsx(style.fileDrag, {
                    [style.hover]: hoverState,
                  })}
                  style={{ cursor: "pointer" }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragOver}
                  onDrop={handleFileSelect}
                >
                  <div className={style.inputWrapper}>
                    <input
                      type="file"
                      tabIndex="-1"
                      className={style.input}
                      name={props.name}
                      onChange={handleFileSelect}
                      ref={inputRef}
                      accept="image/gif, image/jpeg, image/png"
                    />

                    <div className={style.inputCover}>
                      {/* <div className={style.iconArea}>
                                            <FontAwesomeIcon icon={fas["faIceCream"]} />
                                        </div> */}

                      {file ? (
                        <FlexChild>
                          <div className={style.previews}>
                            <FilePreview
                              data={file}
                              tooltip={props.tooltip}
                              onRemove={removeFile}
                              hideLabel={props.hideLabel}
                              cropWidth={props.cropWidth}
                              cropHeight={props.cropHeight}
                              callback={props.callback}
                              onCropAreaChange={props.onCropAreaChange}
                              isWide={isWide}
                            />
                          </div>
                        </FlexChild>
                      ) : (
                        // <span
                        //   className={style.fileName}
                        //   style={{ margin: "auto" }}
                        // >
                        //   {fileName}
                        // </span>
                        <VerticalFlex gap={10}>
                          <FlexChild>
                            <HorizontalFlex gap={10}>
                              <FlexChild justifyContent={"flex-end"}>
                                <img
                                  style={{ width: "45px" }}
                                  src={imageIcon}
                                />
                              </FlexChild>
                              <FlexChild>
                                <img
                                  style={{ width: "45px" }}
                                  src={addFolder}
                                />
                              </FlexChild>
                            </HorizontalFlex>
                          </FlexChild>
                          <FlexChild justifyContent={"center"}>
                            <P color={"#333333"} weight={500} size={16}>
                              이미지 파일을 드래그 앤 드롭해주세요{" "}
                            </P>
                          </FlexChild>
                          {props.placeHolder && (
                            <FlexChild justifyContent={"center"}>
                              <P color={"#999999"} size={12}>
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
                  </div>
                </div>
              </label>
            </FlexChild>
            {/* {
                            file ?
                                <FlexChild>
                                    <div className={style.previews}>
                                        <FilePreview data={file} onRemove={removeFile} cropWidth={props.cropWidth} cropHeight={props.cropHeight} callback={props.callback} onCropAreaChange={props.onCropAreaChange} isWide={isWide} />
                                    </div>
                                </FlexChild>
                                : null
                        } */}
          </VerticalFlex>
        </FlexChild>
      </HorizontalFlex>
    </>
  );
}

export default FileUpload;
