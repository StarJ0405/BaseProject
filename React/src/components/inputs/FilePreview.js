import clsx from "classnames";
import { useEffect, useState } from "react";
import style from "./InputImage.module.scss";

import Loader from "./Loader";

import FlexChild from "components/flex/FlexChild";
import VerticalFlex from "components/flex/VerticalFlex";
import Image from "components/Image/Image";
import P from "components/P/P";
import Tooltip from "components/tooltip/Tooltip";
import EasyCrop from "./EasyCrop";

function FilePreview(props) {
  const [name, setName] = useState();
  const [isLoading, setLoading] = useState(true);
  const [src, setSrc] = useState();
  const [type, setType] = useState();

  const hideChange = props.hideChange ?? false;

  useEffect(() => {
    if (typeof props.data === "string") {
      loadData(props.data);
    } else {
      loadFile(props.data);
    }
  }, [props.data]);

  const loadFile = (file) => {
    const reader = new FileReader();
    let dataType = file.type;
    let fileName = file.name;
    if (file.type.match("text")) {
      dataType = "text";
    } else if (file.type.match("image")) {
      dataType = "image";
    }

    if (dataType === "text") {
      reader.readAsText(file);
    } else if (dataType === "image") {
      reader.readAsDataURL(file);
    }

    reader.onload = (e) => {
      setSrc(e.target.result);
      setType(dataType);
      setLoading(false);
      setName(fileName);
    };
  };

  const loadData = (data) => {
    let dataType = "image";
    setSrc(data);
    setType(dataType);
    setLoading(false);
    setName(data);
  };

  return (
    <div
      className={clsx(style.previewItem, {
        [style.disabled]: isLoading ? true : false,
      })}
    >
      {isLoading ? (
        <Loader />
      ) : type === "image" ? (
        <VerticalFlex gap={10} maxWidth={150}>
          <FlexChild>
            <VerticalFlex gap={5} justifyContent={"center"} width={"100%"}>
              <FlexChild justifyContent={"center"}>
                <Tooltip
                  disable={!props.tooltip}
                  content={<Image size={"min(30vw,30vh)"} src={src} />}
                >
                  <img
                    className={style.previewImage}
                    alt="preview"
                    src={src}
                    style={{ border: "1px solid #ededed" }}
                  />
                </Tooltip>
              </FlexChild>
              {!props.hideLabel && (
                <FlexChild justifyContent={"center"} alignItems={"start"}>
                  {/* <P
                    lineClamp={1}
                    textOverflow={"ellipsis"}
                    whiteSpace={"wrap"}
                    overflow={"hidden"}
                    size={12}
                  >
                    
                  </P> */}
                  <p
                    style={{
                      // -webkit-box 때문에 ...처리가 작동 안해서 이렇게 바꿈
                      fontSize: "12px",
                      fontStyle: "normal",
                      verticalAlign: "middle",
                      whiteSpace: "noWrap",
                      cursor: "inherit",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {name}
                  </p>
                </FlexChild>
              )}
            </VerticalFlex>
          </FlexChild>
          <FlexChild width={"max-content"} gap={10}>
            {!hideChange && (
              <button
                style={{
                  paddingInline: 0,
                  border: "1px solid #2C384AF2",
                  backgroundColor: "#3C4B64",
                  color: "#ffffff",
                  borderRadius: "5px",
                  padding: "2px 7px",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('input[type="file"]').click();
                }}
              >
                <P>변경</P>
              </button>
            )}
            <button
              style={{
                paddingInline: 0,
                // borderWidth: 0,
                backgroundColor: "#ffffff",
                color: "#3C4B64",
                border: "1px solid #2C384AF2",
                borderRadius: "5px",
                padding: "1px 7px",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                props?.onRemove?.();
              }}
            >
              <P>삭제</P>
            </button>
          </FlexChild>
          <FlexChild
            // zIndex={100}
            position={"fixed"}
            zIndex={-10}
            // top={"calc(-1 * max-content)"}
            top={"-1000%"}
            left={"-1000%"}
          >
            <EasyCrop
              image={src}
              cropWidth={props.cropWidth}
              cropHeight={props.cropHeight}
              callback={props.callback}
              onCropAreaChange={props.onCropAreaChange}
              isWide={props.isWide}
            />
          </FlexChild>
        </VerticalFlex>
      ) : type === "text" ? (
        <pre className={style.preview}>{src}</pre>
      ) : (
        <pre className={style.preview}>no preview</pre>
      )}
    </div>
  );
}

export default FilePreview;
