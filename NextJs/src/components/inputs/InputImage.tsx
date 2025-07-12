"use client";
import { toast } from "@/shared/utils/Functions";
import clsx from "clsx";
import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import styles from "./InputImage.module.css";
import { fileRequester } from "@/shared/FileRequester";
// Type for a unified image item in the component's internal state
interface ImageItem {
  id: string; // Unique ID for keying and reordering
  source: File | string; // Can be a File object (user upload) or a string URL (initial value)
  previewUrl: string; // The URL for display in the <img> tag (Base64 or external URL)
  name?: string; // Optional: File name if it's a File object
  type?: string; // Optional: File type if it's a File object
  size?: number; // Optional: File size if it's a File object
  status: "pending" | "uploading" | "uploaded" | "failed" | "initial"; // New: Upload status
  progress?: number; // New: Upload progress percentage (less relevant for batch upload, but kept)
  isNewFile?: boolean; // Flag to distinguish newly selected files from initial/uploaded URLs
}

interface InputImageProps {
  name?: string;
  value?: string[]; // Now accepts an array of URLs (string[]) as initial values
  placeHolder?: string;
  multiple?: boolean;
  maxFiles?: number; // Max number of files/URLs
  maxFileSizeMB?: number;
  allowedFileTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  disabled?: boolean;
  required?: boolean;
  isAllowed?: boolean;
  notAllowedMessage?: string;
  onChange?: (urls: string[]) => void; // Now returns an array of ALL URLs (uploaded + initial)
  style?: CSSProperties;
}

const generateUniqueId = () =>
  `img-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
interface refInterface {
  getName: () => string;
  isValid: () => Promise<boolean>;
  clearFiles: () => void;
  focus: () => void;
  //   getPreviewUrls: () => string[];
  getUrls: () => string[];
}
const InputImage = forwardRef<refInterface, InputImageProps>((props, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    name = "image",
    value = [], // Default to empty array (URLs)
    placeHolder,
    multiple = false,
    maxFiles,
    maxFileSizeMB = 5,
    allowedFileTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    minWidth,
    minHeight,
    disabled = false,
    required = false,
    isAllowed = true,
    notAllowedMessage = "not_allowed",
    onChange,
    style: componentStyle,
  } = props;

  const { t } = useTranslation();
  const [imageItems, setImageItems] = useState<ImageItem[]>([]); // Unified state for all image items
  const [isDragOver, setIsDragOver] = useState(false);
  const [isValid, setValid] = useState(true);
  const [helperText, setHelperText] = useState("");
  const [isUploading, setIsUploading] = useState(false); // New: Overall uploading state

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // --- Helper to process a File into an ImageItem (initial 'pending' state) ---
  const processFileToImageItem = useCallback(
    async (file: File): Promise<ImageItem | null> => {
      // Validate file properties first (size, type, dimensions)
      const validationError = await validateFile(file);
      if (validationError) {
        toast({
          message:
            t("파일 유효성 검사를 통과하지 못했습니다.") + ` (${file.name})`,
        });
        return null;
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: generateUniqueId(),
            source: file,
            previewUrl: reader.result as string, // Base64 preview
            name: file.name,
            type: file.type,
            size: file.size,
            status: "pending", // Mark as pending upload
            isNewFile: true,
          });
        };
        reader.onerror = () => {
          toast({
            message:
              t("이미지 미리보기를 생성할 수 없습니다.") + ` (${file.name})`,
          });
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    },
    [maxFileSizeMB, allowedFileTypes, minWidth, minHeight, t]
  );

  // --- Effect to synchronize external `value` prop (URLs) with internal `imageItems` state ---
  useEffect(() => {
    // Get URLs from `value` prop that are not currently in imageItems as uploaded or initial URLs
    const currentUploadedOrInitialUrls = new Set(
      imageItems
        .filter(
          (item) => item.status === "uploaded" || item.status === "initial"
        )
        .map((item) => item.previewUrl)
    );

    // Identify URLs from `value` prop that are missing in our current state
    const urlsToInit = value.filter(
      (url) => !currentUploadedOrInitialUrls.has(url)
    );

    // Identify items in our state (excluding new 'pending' files) that are no longer in `value` prop
    const itemsToRemove = imageItems.filter(
      (item) =>
        (item.status === "uploaded" || item.status === "initial") &&
        !value.includes(item.previewUrl)
    );

    if (urlsToInit.length > 0 || itemsToRemove.length > 0) {
      setImageItems((prevItems) => {
        let updatedItems = prevItems.filter(
          (item) =>
            !(item.status === "uploaded" || item.status === "initial") ||
            value.includes(item.previewUrl)
        ); // Remove items not in value, keep pending/uploading files

        // Add new initial URLs
        urlsToInit.forEach((url) => {
          if (!updatedItems.some((item) => item.previewUrl === url)) {
            // Prevent adding duplicates
            updatedItems.push({
              id: generateUniqueId(),
              source: url,
              previewUrl: url,
              status: "initial", // Mark as initial URL
              isNewFile: false,
            });
          }
        });
        return updatedItems;
      });
    }
  }, [value, imageItems]); // Dependency on imageItems is crucial for correct sync

  // --- Imperative Handle ---
  useImperativeHandle(ref, () => ({
    getName: () => name,
    getUrls: () =>
      imageItems
        // .filter(
        //   (item) => item.status === "uploaded" || item.status === "initial"
        // )
        .map((item) => item.previewUrl), // Only return URLs of successfully uploaded/initial images
    isValid: async (): Promise<boolean> => {
      if (disabled || !isAllowed) {
        toast({ message: t(notAllowedMessage) });
        return false;
      }

      // 1. Perform general validation (required, maxFiles)
      let validationPassed = true;
      let currentHelperText = "";

      if (required && imageItems.length === 0) {
        validationPassed = false;
        currentHelperText = t("하나 이상의 이미지를 선택해주세요.");
      } else if (
        multiple &&
        maxFiles !== undefined &&
        imageItems.length > maxFiles
      ) {
        validationPassed = false;
        currentHelperText = t(
          `최대 ${maxFiles}개의 이미지만 선택할 수 있습니다.`
        );
      }

      setValid(validationPassed);
      setHelperText(currentHelperText);

      if (!validationPassed) {
        toast({
          message: t("이미지 유효성 검사 실패. 오류 메시지를 확인하세요."),
        });
        return false;
      }

      // 2. Identify files that need to be uploaded
      const filesToUpload = imageItems.filter(
        (item) =>
          item.status === "pending" &&
          item.isNewFile &&
          typeof item.source !== "string"
      ) as ImageItem[];

      // 업로드할 파일이 없으면 바로 유효하다고 판단하고 종료
      if (filesToUpload.length === 0) {
        toast({ message: t("업로드할 새로운 파일이 없습니다.") });
        return true;
      }

      // 3. Initiate Batch Upload Process for pending files
      setIsUploading(true);
      toast({ message: t("파일 업로드를 시작합니다...") });

      // *** 여기에서 최종 상태를 계산할 변수를 초기화합니다. ***
      let newImageItemsState: ImageItem[] = [...imageItems]; // 현재 imageItems 상태를 복사하여 시작

      try {
        // UI에만 '업로드 중' 상태를 바로 반영 (실제 업로드 전)
        // 이 setImageItems 호출은 비동기이며, 이 함수의 현재 실행 흐름에는 즉시 반영되지 않음
        setImageItems((prev) =>
          prev.map((item) =>
            item.status === "pending"
              ? { ...item, status: "uploading", progress: 0 }
              : item
          )
        );

        const formData = new FormData();
        filesToUpload.forEach((item) => {
          formData.append("files", item.source as File);
        });

        // --- fileRequester.upload 부분은 절대 수정하지 않습니다. ---
        const response: any = await fileRequester.upload(formData);
        const uploadedUrls = (response?.urls || []) as string[];
        // --- fileRequester.upload 부분은 절대 수정하지 않습니다. (끝) ---

        // 업로드된 URL 수가 전송된 파일 수와 일치하지 않으면 오류
        if (uploadedUrls.length !== filesToUpload.length) {
          throw new Error(
            "업로드된 URL 수가 전송된 파일 수와 일치하지 않습니다."
          );
        }

        // --- 업로드 성공 시, newImageItemsState를 업데이트 ---
        filesToUpload.forEach((originalItem, index) => {
          const uploadedUrl = uploadedUrls[index];
          const itemIndex = newImageItemsState.findIndex(
            // newImageItemsState를 기반으로 찾고 업데이트
            (i) => i.id === originalItem.id
          );
          if (itemIndex !== -1) {
            newImageItemsState[itemIndex] = {
              ...newImageItemsState[itemIndex],
              status: "uploaded",
              previewUrl: uploadedUrl,
              source: uploadedUrl,
              progress: 100,
            };
          }
        });

        toast({ message: t("모든 파일 업로드가 완료되었습니다.") });
        validationPassed = true; // 업로드 성공
      } catch (error) {
        console.error("Batch upload failed:", error);
        toast({ message: t("일괄 파일 업로드에 실패했습니다.") });

        // --- 업로드 실패 시, newImageItemsState를 업데이트 ---
        filesToUpload.forEach((originalItem) => {
          const itemIndex = newImageItemsState.findIndex(
            // newImageItemsState를 기반으로 찾고 업데이트
            (i) => i.id === originalItem.id
          );
          if (itemIndex !== -1) {
            newImageItemsState[itemIndex] = {
              ...newImageItemsState[itemIndex],
              status: "failed",
              progress: 0,
            };
          }
        });
        validationPassed = false; // 업로드 실패
      } finally {
        setIsUploading(false); // 업로드 상태 해제
        // 최종적으로 계산된 newImageItemsState로 React 상태를 업데이트합니다.
        setImageItems(newImageItemsState);
      }

      // 4. Final check: 방금 계산된 newImageItemsState를 사용하여 최종 유효성 검사
      const hasFailedOrPendingUploads = newImageItemsState.some(
        (item) =>
          item.status === "failed" ||
          item.status === "pending" || // 이 시점에는 pending이 없어야 함
          item.status === "uploading" // 이 시점에는 uploading도 없어야 함
      );

      const finalResult = validationPassed && !hasFailedOrPendingUploads;

      if (finalResult) {
        // Trigger onChange with the new set of URLs
        onChange?.(
          newImageItemsState
            .filter(
              (item) => item.status === "uploaded" || item.status === "initial"
            )
            .map((item) => item.previewUrl)
        );
      } else {
        toast({ message: t("일부 파일 업로드에 실패했거나 대기 중입니다.") });
      }

      return finalResult;
    },
    clearFiles: () => {
      setImageItems([]);
      onChange?.([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    focus: () => {
      fileInputRef.current?.click();
    },
  }));

  // --- File Validation Logic (for newly uploaded files) ---
  const validateFile = useCallback(
    async (file: File, showToast = false): Promise<string | null> => {
      if (!isAllowed) {
        if (showToast) toast({ message: t(notAllowedMessage) });
        return "not_allowed";
      }
      if (
        allowedFileTypes.length > 0 &&
        !allowedFileTypes.includes(file.type)
      ) {
        if (showToast)
          toast({
            message: t(
              `지원하지 않는 파일 형식입니다: ${
                file.type
              }. 허용된 형식: ${allowedFileTypes.join(", ")}`
            ),
          });
        return "invalid_type";
      }
      if (maxFileSizeMB && file.size > maxFileSizeMB * 1024 * 1024) {
        if (showToast)
          toast({ message: t(`파일 크기가 ${maxFileSizeMB}MB를 초과합니다.`) });
        return "file_too_large";
      }

      if ((minWidth || minHeight) && file.type.startsWith("image/")) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            let error: string | null = null;
            if (minWidth && img.width < minWidth) {
              error = `이미지 너비는 ${minWidth}px 이상이어야 합니다. (현재: ${img.width}px)`;
            }
            if (minHeight && img.height < minHeight) {
              error = `${
                error ? error + ". " : ""
              }이미지 높이는 ${minHeight}px 이상이어야 합니다. (현재: ${
                img.height
              }px)`;
            }
            if (error && showToast) toast({ message: t(error) });
            resolve(error ? "invalid_dimensions" : null);
          };
          img.onerror = () => {
            if (showToast)
              toast({
                message: t(
                  "이미지를 로드할 수 없습니다. 파일이 손상되었을 수 있습니다."
                ),
              });
            resolve("image_load_error");
          };
          img.src = URL.createObjectURL(file);
        });
      }
      return null;
    },
    [
      allowedFileTypes,
      maxFileSizeMB,
      minWidth,
      minHeight,
      isAllowed,
      notAllowedMessage,
      t,
    ]
  );

  // --- File Handling Functions (for user interaction: select/drop) ---
  const handleProcessAndAddFiles = useCallback(
    async (files: File[]) => {
      if (disabled || !isAllowed) {
        toast({ message: t(notAllowedMessage) });
        return;
      }

      const currentActiveOrUploadedItemCount = imageItems.filter(
        (item) =>
          item.status === "uploaded" ||
          item.status === "initial" ||
          item.status === "pending" ||
          item.status === "uploading"
      ).length;

      let filesToAdd = Array.from(files);

      if (multiple && maxFiles !== undefined) {
        if (currentActiveOrUploadedItemCount >= maxFiles) {
          toast({
            message: t(`최대 ${maxFiles}개의 이미지만 선택할 수 있습니다.`),
          });
          return;
        }
        const remainingSlots = maxFiles - currentActiveOrUploadedItemCount;
        filesToAdd = filesToAdd.slice(0, remainingSlots);
        if (filesToAdd.length < files.length) {
          toast({
            message: t(
              `일부 파일은 최대 파일 개수를 초과하여 추가되지 않았습니다.`
            ),
          });
        }
      } else if (!multiple && filesToAdd.length > 1) {
        filesToAdd = filesToAdd.slice(0, 1);
      }

      const newImageItemsPromises = filesToAdd.map(processFileToImageItem);
      const results = await Promise.all(newImageItemsPromises);
      const validNewImageItems = results.filter(Boolean) as ImageItem[];

      setImageItems((prevItems) => {
        let updatedItems: ImageItem[];
        if (!multiple) {
          // For single mode, if a new file is valid, replace ALL existing items (including initial/uploaded)
          updatedItems =
            validNewImageItems.length > 0 ? validNewImageItems : [];
          // If no new valid item, keep only uploaded/initial ones that were previously there
          if (
            validNewImageItems.length === 0 &&
            prevItems.some(
              (item) => item.status === "uploaded" || item.status === "initial"
            )
          ) {
            updatedItems = prevItems.filter(
              (item) => item.status === "uploaded" || item.status === "initial"
            );
          }
        } else {
          // For multiple mode, add valid new items, avoiding duplicates by file identity
          const existingFileIdentities = new Set(
            imageItems
              .filter((item) => item.isNewFile)
              .map((item) => `${item.name}-${item.size}`)
          );
          const trulyNewItems = validNewImageItems.filter(
            (newItem) =>
              !existingFileIdentities.has(`${newItem.name}-${newItem.size}`)
          );
          updatedItems = [...prevItems, ...trulyNewItems];
        }
        return updatedItems;
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [
      disabled,
      isAllowed,
      notAllowedMessage,
      multiple,
      maxFiles,
      processFileToImageItem,
      imageItems,
      t,
    ]
  );

  // --- Event Handlers ---
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleProcessAndAddFiles(Array.from(e.target.files));
      }
    },
    [handleProcessAndAddFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled || !isAllowed || isUploading) return;
      setIsDragOver(true);
    },
    [disabled, isAllowed, isUploading]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled || !isAllowed || isUploading) {
        toast({ message: t(notAllowedMessage) });
        return;
      }
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleProcessAndAddFiles(Array.from(e.dataTransfer.files));
      }
    },
    [
      disabled,
      isAllowed,
      notAllowedMessage,
      handleProcessAndAddFiles,
      isUploading,
      t,
    ]
  );

  const handleRemoveImage = useCallback(
    (idToRemove: string) => {
      if (disabled || isUploading) return;
      setImageItems((prevItems) => {
        const updatedItems = prevItems.filter((item) => item.id !== idToRemove);
        // If an uploaded or initial item is removed, notify parent of URL change immediately
        onChange?.(
          updatedItems
            .filter(
              (item) => item.status === "uploaded" || item.status === "initial"
            )
            .map((item) => item.previewUrl)
        );
        return updatedItems;
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [disabled, isUploading, onChange]
  );

  const handleClearAll = useCallback(() => {
    if (disabled || isUploading) return;
    setImageItems([]);
    onChange?.([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [disabled, isUploading, onChange]);

  // --- Drag & Drop Reordering Handlers ---
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      if (disabled || isUploading) return;
      dragItem.current = index;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());
      e.currentTarget.classList.add(styles.dragging);
    },
    [disabled, isUploading]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      if (disabled || isUploading) return;
      dragOverItem.current = index;
    },
    [disabled, isUploading]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.classList.remove(styles.dragging);

      if (
        dragItem.current !== null &&
        dragOverItem.current !== null &&
        dragItem.current !== dragOverItem.current
      ) {
        setImageItems((prevItems) => {
          const updatedItems = [...prevItems];
          const draggedItem = updatedItems[dragItem.current!];
          updatedItems.splice(dragItem.current!, 1);
          updatedItems.splice(dragOverItem.current!, 0, draggedItem);
          // Only trigger onChange for URLs that are already uploaded/initial
          onChange?.(
            updatedItems
              .filter(
                (item) =>
                  item.status === "uploaded" || item.status === "initial"
              )
              .map((item) => item.previewUrl)
          );
          return updatedItems;
        });
      }
      dragItem.current = null;
      dragOverItem.current = null;
    },
    [onChange, disabled, isUploading]
  );

  // --- Overall Validation (triggered by state changes) ---
  useEffect(() => {
    let currentIsValid = true;
    let currentHelperText = "";

    if (required && imageItems.length === 0) {
      currentIsValid = false;
      currentHelperText = t("하나 이상의 이미지를 선택해주세요.");
    } else if (
      multiple &&
      maxFiles !== undefined &&
      imageItems.length > maxFiles
    ) {
      currentIsValid = false;
      currentHelperText = t(
        `최대 ${maxFiles}개의 이미지만 선택할 수 있습니다.`
      );
    }
    // Also, if there are failed or pending/uploading uploads, it's not truly 'valid' for final submission
    const hasIssues = imageItems.some(
      (item) =>
        item.status === "failed" ||
        item.status === "pending" ||
        item.status === "uploading"
    );
    if (hasIssues) {
      currentIsValid = false;
      if (!currentHelperText) {
        // Don't overwrite more specific messages
        currentHelperText = t("업로드 대기 중이거나 실패한 파일이 있습니다.");
      }
    }

    setValid(currentIsValid);
    setHelperText(currentHelperText);
  }, [imageItems, required, multiple, maxFiles, t]);

  return (
    <div className={styles.container} style={componentStyle}>
      <input
        type="file"
        ref={fileInputRef}
        name={name}
        className={styles.fileInput}
        onChange={handleFileChange}
        multiple={multiple}
        accept={allowedFileTypes.join(",")}
        disabled={disabled || isUploading} // Disable native input during upload
      />

      <div
        className={clsx(styles.dropzone, {
          [styles.dragOver]: isDragOver,
          [styles.disabled]: disabled || !isAllowed || isUploading,
        })}
        onClick={() => {
          if (disabled || isUploading) {
            if (!isAllowed) toast({ message: t(notAllowedMessage) });
            return;
          }
          if (!isAllowed) {
            toast({ message: t(notAllowedMessage) });
          } else {
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className={styles.uploadIcon}>⬆️</span>
        <p className={styles.dropzoneText}>
          {t("파일을 여기에 드래그앤드롭하거나 클릭하여 선택하세요.")}
          {isUploading && ` (${t("업로드 중...")})`}
        </p>
        {placeHolder && <p className={styles.placeHolder}>{t(placeHolder)}</p>}
      </div>

      {imageItems.length > 0 && (
        <>
          <div className={styles.previewContainer}>
            {imageItems.map((item, index) => (
              <div
                key={item.id}
                className={clsx(styles.imageWrapper)}
                draggable={multiple && !disabled && !isUploading} // Disable dragging during upload
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
              >
                <img
                  src={item.previewUrl}
                  alt={item.name || `Image ${index}`}
                />
                {item.status === "pending" && (
                  <div
                    className={styles.statusOverlay}
                    // style={{ backgroundColor: "rgba(255,255,0,0.6)" }}
                    style={{ backgroundColor: "rgba(108,117,125,0.6)" }}
                  >
                    {t("대기 중")}
                  </div>
                )}
                {item.status === "uploading" && (
                  <div
                    className={styles.statusOverlay}
                    style={{ backgroundColor: "rgba(0,123,255,0.6)" }}
                  >
                    {t("업로드 중")}
                  </div>
                )}
                {/* Progress is hard for batch */}
                {item.status === "failed" && (
                  <div
                    className={styles.statusOverlay}
                    style={{ backgroundColor: "rgba(220,53,69,0.6)" }}
                  >
                    {t("실패")}
                  </div>
                )}
                {/* {item.status === "uploaded" && (
                  <div
                    className={styles.statusOverlay}
                    style={{ backgroundColor: "rgba(40,167,69,0.6)" }}
                  >
                    {t("완료")}
                  </div>
                )} */}
                {/* {item.status === "initial" && (
                  <div
                    className={styles.statusOverlay}
                    style={{ backgroundColor: "rgba(108,117,125,0.6)" }}
                  >
                    {t("기존")}
                  </div>
                )} */}
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveImage(item.id)}
                  disabled={disabled || isUploading} // Disable remove during upload
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          {!disabled && multiple && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearAll}
              disabled={disabled || isUploading} // Disable clear during upload
            >
              {t("모두 지우기")}
            </button>
          )}
        </>
      )}

      {helperText.length > 0 && (
        <div className={styles.requestMessage}>{helperText}</div>
      )}
    </div>
  );
});

InputImage.displayName = "InputImage";

export default InputImage;
