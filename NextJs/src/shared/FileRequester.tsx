import axios from "axios";
const mode = process.env.REACT_APP_MODE;

const origin = mode
  ? process.env["NEXT_PUBLIC_BACK_" + mode.toUpperCase()] ||
    process.env.NEXT_PUBLIC_BACK
  : process.env.NEXT_PUBLIC_BACK;

class _FileRequester {
  instance;

  constructor() {
    this.instance = axios.create({
      baseURL: origin,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
  }

  async upload(data: any, path?: string) {
    try {
      let promise = new Promise((resolve, reject) => {
        let result = "";
        this.instance
          .post(
            `uploads${path ? `/${path}` : ""}`.replace(/\/\//g, "/"),
            data,
            {}
          )
          .then((res) => {
            result = res.data;
          })
          .catch((ex) => {
            result = ex;
          })
          .finally(() => {
            resolve(result);
          });
      });
      return await promise;
    } catch (e) {}
  }
  async download(url: string, name: string) {
    fetch(url, {
      method: "GET",
      mode: "cors",
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement("a");

        element.setAttribute("href", url);
        const type = url.includes(".") ? url.split("\\.") : ["png"];
        element.setAttribute("download", `${name}.${type[type.length - 1]}`);

        document.body.appendChild(element);

        element.click();

        element?.parentNode?.removeChild(element);
        window.URL.revokeObjectURL(url);
      });
  }
}

export default _FileRequester;

// export const fileRequester = new _FileRequester();

let fileRequester: _FileRequester;

if (typeof window === "undefined") {
  // 서버 사이드 (Node.js)
  // 개발 모드에서 HMR로 인해 여러 인스턴스가 생성되는 것을 방지
  if (!(global as any).fileRequesterInstance) {
    (global as any).fileRequesterInstance = new _FileRequester();
  }
  fileRequester = (global as any).fileRequesterInstance;
} else {
  // 클라이언트 사이드 (브라우저)
  if (!(window as any).fileRequesterInstance) {
    (window as any).filefileRequesterInstance = new _FileRequester();
  }
  fileRequester = (window as any).fileRequesterInstance;
}

export { fileRequester };
