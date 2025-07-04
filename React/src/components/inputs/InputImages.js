import NiceModal from "@ebay/nice-modal-react";
import { fileRequester } from "App";
import { ReduxCheckboxGroup } from "components/checkbox/ReduxCheckboxGroup";
import { ReduxCheckboxItem } from "components/checkbox/ReduxCheckboxItem";
import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import FlexGrid from "components/flex/FlexGrid";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import Icon from "components/icons/Icon";
import CustomImage from "components/Image/Image";
import P from "components/P/P";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useCheckboxGroup } from "shared/hooks/useCheckboxGroup";
import {
  compressImage,
  createImageFileFromDom,
  dataURLtoBlob,
  toast,
} from "shared/utils/Utils";
import { v4 as uuidv4 } from "uuid";
import EasyCrop from "./EasyCrop";
import Loader from "./Loader";

const InputImages = forwardRef(
  (
    {
      values = [],
      maxSizeMb,
      path = "/",
      name,
      cropWidth,
      cropHeight,
      max = 8,
      columns = 4,
      width = 300,
      height = 300,
      maxWidthOrHeight,
    },
    ref
  ) => {
    const { uncheck } = useCheckboxGroup();
    const inputRef = useRef();
    const [hoverState, setHoverState] = useState(false);
    const [files, setFiles] = useState(values || []);
    const imagesRef = useRef([]);
    const value = useRef();
    const [selected, setSelected] = useState([]);
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
      const sum = newFiles?.length + files?.length;
      if (sum > max) {
        e.target.value = null;
        toast({
          type: "error",
          message: `최대 ${max}개까지 업로드 가능합니다.`,
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

      uploadResult?.uploads.forEach((upload, index) => {
        if (String(upload.url).includes("gif")) {
          const array = upload.extra || [];
          if (array.length > 0) {
            value.current[filter[index].index] = array?.[0];
          } else value.current[filter[index].index] = upload.url;
        } else value.current[filter[index].index] = upload.url;
      });

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
        return value.current;
      },
      async upload(callback) {
        let result = await uploadFiles();
        callback(result);
      },
      async isValid() {
        return await uploadFiles();
      },
      focus() {},
    }));
    return (
      <div style={{ position: "relative" }}>
        <input
          hidden
          type="file"
          multiple
          ref={inputRef}
          accept="image/gif, image/jpeg, image/png"
          onChange={handleFileSelect}
        />
        <VerticalFlex gap={10}>
          <FlexChild>
            <ReduxCheckboxGroup
              values={files?.map((_, index) => `image_${index}`)}
              onChange={(values) => setSelected(values)}
            >
              <FlexGrid
                columns={columns}
                // columns={Math.min(columns, Math.floor(window.innerWidth / width))}
                rows={files?.length < columns ? 1 : max / Math.max(1, columns)}
                gap={10}
              >
                {files?.map((file, index) => (
                  <FlexChild
                    key={`${file?.name || file?.url || file}_${index}`}
                    width={width}
                    height={height}
                  >
                    <FilePreview
                      selected={[...selected]?.includes(`image_${index}`)}
                      data={file}
                      onRemove={() => removeFile(index)}
                      cropWidth={cropWidth}
                      cropHeight={cropHeight}
                      callback={(imageDiv) => {
                        imagesRef.current[index] = imageDiv;
                      }}
                      index={index}
                      width={width}
                      height={height}
                      onCropAreaChange={() => {}}
                    />
                  </FlexChild>
                ))}
                {files?.length < max && (
                  <FlexChild>
                    {/* 각 이미지 카드 */}
                    <Div
                      width={width}
                      height={height}
                      cursor={"pointer"}
                      onClick={() => inputRef?.current.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragOver}
                      onDrop={handleFileSelect}
                      border={"1px solid #e6e6e6"}
                      borderRadius={3}
                    >
                      <Icon name={hoverState ? "photo_drag" : "photo"} />
                    </Div>
                  </FlexChild>
                )}
              </FlexGrid>
            </ReduxCheckboxGroup>
          </FlexChild>
          <FlexChild paddingTop={10}>
            <HorizontalFlex justifyContent={"flex-start"} gap={6}>
              <FlexChild width={"max-content"}>
                <Div
                  cursor={"pointer"}
                  border={"1px solid var(--main-color)"}
                  borderRadius={3}
                  padding={"5px 10px"}
                  onClick={() => {
                    const indexes = [...selected]
                      ?.map((key) => Number(key?.split("_")[1]))
                      .sort((i1, i2) => i1 - i2);

                    setFiles([
                      ...(files?.filter(
                        (_, index) => !indexes.includes(index)
                      ) || []),
                    ]);
                    selected.forEach((select) => uncheck(select));
                  }}
                >
                  <P size={14} textAlign="center" color={"var(--main-color)"}>
                    deleteSelection
                  </P>
                </Div>
              </FlexChild>
              <FlexChild width={"max-content"}>
                <Div
                  cursor={"pointer"}
                  border={"1px solid var(--main-color)"}
                  borderRadius={3}
                  padding={"5px 10px"}
                  onClick={() => {
                    files?.forEach((_, index) => uncheck(`image_${index}`));
                    setFiles([]);
                  }}
                >
                  <P size={14} textAlign="center" color={"var(--main-color)"}>
                    deleteAll
                  </P>
                </Div>
              </FlexChild>
            </HorizontalFlex>
          </FlexChild>
        </VerticalFlex>
      </div>
    );
  }
);
function FilePreview(props) {
  const [name, setName] = useState();
  const [isLoading, setLoading] = useState(true);
  const [src, setSrc] = useState();
  const [type, setType] = useState();

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
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <FlexChild
          position={"relative"}
          width={props.width}
          height={props.height}
        >
          <CustomImage
            borderRadius={3}
            src={src}
            width={props.width}
            height={props.height}
            border={props.selected ? "3px solid var(--main-color)" : ""}
          />
          <Div
            position="absolute"
            borderRadius={3}
            backgroundColor={"rgba(0,0,0,0.1)"}
            width={props.width}
            height={props.height}
            zIndex={1}
          />
          <Div
            position="absolute"
            zIndex={1}
            top={0}
            left={0}
            width={"30%"}
            cursor={"pointer"}
            padding={"5%"}
          >
            <ReduxCheckboxItem
              size="100%"
              value={`image_${props.index || 0}`}
            />
          </Div>
          <Div
            position="absolute"
            zIndex={1}
            bottom={0}
            right={0}
            width={"30%"}
            cursor={"pointer"}
            onClick={() =>
              NiceModal.show("maximize", {
                src,
                width: "min(30vw,600px)",
                height: null,
              })
            }
          >
            <Icon name="bigsize" />
          </Div>

          {/* <HorizontalFlex>
              <FlexChild width={100}>
                <img className={style.previewImage} alt="preview" src={src} />
              </FlexChild>
              <FlexChild>
                <p>{name}</p>
              </FlexChild>
              <FlexChild width={"max-content"}>
                <button
                  // className={style.button}
                  onClick={(e) => {
                    e.preventDefault();
                    props?.onRemove?.();
                  }}
                >
                  remove
                </button>
              </FlexChild>
            </HorizontalFlex> */}
          <FlexChild
            zIndex={-10}
            position={"fixed"}
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
        </FlexChild>
      )}
    </div>
  );
}
export default InputImages;
