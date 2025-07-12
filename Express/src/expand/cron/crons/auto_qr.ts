import * as fs from "fs/promises";
import path from "path";
import * as qrcode from "qrcode";
import { LinkService } from "services/link";
import { container } from "tsyringe";
import { schedule } from "../module";

let page = 0;
const limit = 1000;
let isWork = false;
export function regist(DEV: boolean) {
  const _path = path.join(__dirname, "../../../../uploads/qr");
  fs.mkdir(_path, { recursive: true }).then(() => {
    fs.readdir(_path, { withFileTypes: true }).then((res) => {
      page = res.filter((f) => f.isDirectory()).length;

      console.log(page);
      schedule("*/10 * * * * *", async () => {
        if (isWork) return;
        isWork = true;
        //   try {
        const service: LinkService = container.resolve(LinkService);
        const count = await service.getCount();
        //     console.log(count);
        if (page * limit > count) {
          console.log("finished!!!!!!!!!!");
          return;
        }
        console.log(page * limit, count);

        //   } catch (err) {
        //     console.log("error", err);
        //     console.error("error", err);
        //     process.exit(1);
        //   }

        const links = await service.getList({
          skip: page * limit,
          take: limit,
          order: {
            created_at: "ASC",
          },
        });
        await fs.mkdir(path.join(_path, `${page}`), { recursive: true });
        links.forEach(async (link) => {
          const fileNmae = `${page}/${link.id}.png`;
          const filePath = path.join(_path, fileNmae);
          await qrcode.toFile(
            filePath,
            `http://worldeco.kro.kr:13000/qr/${link.id}`,
            {
              errorCorrectionLevel: "H",
              width: 256,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            }
          );
        });
        page += 1;
        isWork = false;
      });
    });
  });
}
