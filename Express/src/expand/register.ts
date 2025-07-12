import fs from "fs";
import path from "path";

const EXPAND = process.env.EXPAND;
const DEV = process.env.DEV === "true";

interface Module {
  init?: (DEV: boolean) => void;
}

export function initializeModules(): void {
  if (!EXPAND) return;
  const moduleFolders = EXPAND.split(",");

  for (const folderName of moduleFolders) {
    if (__dirname.includes("dist")) __regist_init(folderName, "js");
    else __regist_init(folderName, "ts");
  }
}

function __regist_init(folderName: string, fileType: "ts" | "js") {
  const modulePath = path.join(__dirname, folderName, `module.${fileType}`);

  if (fs.existsSync(modulePath)) {
    try {
      import(modulePath)
        .then((module: Module) => {
          if (typeof module.init === "function") {
            module.init(DEV);
          } else {
            console.warn(
              `Module at ${modulePath} found, but no 'init' function exported.`
            );
          }
        })
        .catch((error) => {
          console.error(`Error importing module from ${modulePath}:`, error);
        });
    } catch (error) {
      console.error(
        `Failed to load or initialize module from ${modulePath}:`,
        error
      );
    }
  }
}
