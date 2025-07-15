import { ApiHandler, SocketHandler } from "app";
import { Link } from "models/link";
import { LinkService } from "services/link";
import { container } from "tsyringe";

export const POST: ApiHandler = async (req, res) => {
  const {
    start_date,
    end_date,
    chance = 1,
    data,
    metadata,
    amount = 1,
    return_data = false,
  } = req.body;

  const service: LinkService = container.resolve(LinkService);
  try {
    let result: Link[] = [];
    const _data = { start_date, end_date, chance, data, metadata };
    if (amount === 1) {
      result = [await service.create(_data)];
    } else {
      result = await service.creates(_data, amount);
    }
    res.json(return_data ? { content: result } : { message: "success" });
  } catch (err) {
    res.status(500).send(err);
  }
};

export const GET: ApiHandler = async (req, res) => {
  let { pageSize, pageNumber = 0, sort, ...where } = req.query;
  const service: LinkService = container.resolve(LinkService);
  if (pageSize) {
    const page = await service.getPageable(
      {
        pageSize: Number(pageSize),
        pageNumber: Number(pageNumber),
      },
      where
    );
    res.json(page);
  } else {
    const content = await service.getList(where);
    res.json({ content });
  }
};

export const SOCKET: SocketHandler = (socket, io, url, data) => {
  console.log("yes!", data, `links/${data?.index}`);

  io.sockets.emit(`/links/${data?.index}`, data);
};
