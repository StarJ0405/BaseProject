import fs from "fs";
import cron, { TaskOptions } from "node-cron";
import path from "path";
const CRONS = process.env.CRONS;

interface Cron {
  regist?: (DEV: boolean) => void;
}

export function init(DEV: boolean) {
  if (!CRONS) return;
  const moduleFolders = CRONS.split(",");

  for (const fileName of moduleFolders) {
    if (__dirname.includes("dist")) __regist_init(DEV, fileName, "js");
    else __regist_init(DEV, fileName, "ts");
  }
}

function __regist_init(DEV: boolean, fileName: string, fileType: "ts" | "js") {
  const modulePath = path.join(__dirname, "crons", `${fileName}.${fileType}`);

  if (fs.existsSync(modulePath)) {
    try {
      import(modulePath)
        .then((module: Cron) => {
          if (typeof module.regist === "function") {
            module.regist(DEV);
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

export function schedule(
  expression: string,
  func: () => void | Promise<void>,
  options?: TaskOptions
) {
  cron.schedule(expression, func, options);
}
