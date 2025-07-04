import { fileRequester } from "App";
import _ from "lodash";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createImageFileFromDom, dataURLtoBlob } from "shared/utils/Utils";
import { v4 as uuidv4 } from "uuid";
import FileUpload from "./FileUpload";
import style from "./InputImage.module.scss";

const InputImage = forwardRef((props, ref) => {
  const input = useRef();
  const value = useRef();
  const extra = useRef([]);
  const [name, setName] = useState(props.name || "");
  const [imageRef, setImageRef] = useState();
  const [isChanged, setChanged] = useState(false);
  const [isFileChanged, setFileChanged] = useState(false);
  const [isCropAreaChanged, setCropAreaChanged] = useState(false);
  const [isEmpty, setEmpty] = useState();
  // const [value, setValue] = useState(null);
  const [preview, setPreview] = useState(props.value);
  const [colors, setColors] = useState([]);

  const uploadFile = async () => {
    let response = { code: -1, data: "", message: "" };

    if (isEmpty || !isChanged) {
      response.code = 0;
      if (!isChanged) {
        response.data = props.value;
        value.current = props.value;
      } else value.current = null;
    } else {
      let file;
      const isGif = preview && preview.startsWith("data:image/gif;");
      if (isGif) {
        const jsFile = dataURLtoBlob(preview);
        const fileName = uuidv4() + ".gif";
        file = new File([jsFile], fileName, { type: "gif" });
      } else file = await createImageFileFromDom(imageRef);
      if (typeof file === "object") {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", props.path);

        let uploadResult = await fileRequester.upload(
          formData,
          props.path,
          true,
          [
            ...(isGif ? [{ size: props.maxWidthOrHeight || 1920 }] : []),
            ...(props.resize || []),
          ]
        );
        if (!isGif) {
          value.current = uploadResult?.uploads?.[0]?.url;
          extra.current = uploadResult?.uploads?.[0]?.extra || [];
        } else {
          const array = uploadResult?.uploads?.[0]?.extra || [];
          if (array.length > 0) {
            const [_value, ..._extra] = array;
            value.current = _value;
            extra.current = _extra || [];
          } else {
            value.current = uploadResult?.uploads?.[0]?.url;
            extra.current = uploadResult?.uploads?.[0]?.extra || [];
          }
        }
        return !!value.current;
      } else {
        response.message = file;
      }
    }
    let validationResult = response.code === 0 ? true : false;
    return validationResult;
  };

  const imageCallback = (imageDiv) => {
    // ReactDOM
    if (imageDiv.children?.[0]?.src) {
      setPreview(imageDiv.children?.[0]?.src);
    }
    setImageRef(imageDiv);
  };

  const onFileChange = (file) => {
    if (file) {
      setEmpty(false);
    } else {
      setEmpty(true);
    }

    let isEqual = _.isEqual(file, props.value);
    if (isEqual) {
      setFileChanged(false);
    } else {
      setFileChanged(true);
    }
  };

  const onCropAreaChange = (isCropAreaChanged) => {
    setCropAreaChanged(isCropAreaChanged);
  };

  const onChangeColors = (colors) => {
    setColors(colors);
    if (props.onChangeColors) {
      props.onChangeColors(colors);
    }
  };

  useImperativeHandle(ref, () => ({
    getName() {
      return name;
    },
    getValue() {
      return value.current;
    },
    getExtra() {
      return extra.current;
    },
    getPreview() {
      return preview;
    },
    getColors() {
      return colors;
    },
    async upload(callback) {
      let result = await uploadFile();
      callback(result);
    },
    isChanged() {
      return isChanged;
    },
    async isValid() {
      return await uploadFile();
    },
    focus() {
      input?.current?.scrollTo?.(0, input.current.offsetTop);
    },
    empty() {
      value.current = null;
      setPreview(null);
    },
  }));

  useEffect(() => {
    value.current = props.value;
    setPreview(props.value);
  }, [props.value]);

  useEffect(() => {
    setChanged(isFileChanged || isCropAreaChanged);
  }, [isFileChanged, isCropAreaChanged]);

  return (
    <div
      ref={input}
      className={style.wrapper}
      style={{ width: props.width, height: props.height }}
    >
      <FileUpload
        multiple={true}
        name="example-upload"
        maxSize={300000}
        // onUpload={uploadFileToServer}
        // label={"라벨"}
        // labelWidth={70}
        tooltip={props.tooltip}
        hideLabel={props.hideLabel}
        cropWidth={props.cropWidth || 70}
        cropHeight={props.cropHeight || 70}
        callback={imageCallback}
        value={value.current}
        onChange={onFileChange}
        onChangeColors={onChangeColors}
        onCropAreaChange={onCropAreaChange}
        maxSizeMb={props.maxSizeMb}
        maxWidthOrHeight={props.maxWidthOrHeight}
        placeHolder={props.placeHolder}
      />
    </div>
  );
});

export default InputImage;
