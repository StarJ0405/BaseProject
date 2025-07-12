import { Request, Response } from "express";
import { Link } from "models/link";
import { LinkService } from "services/link";
import { container } from "tsyringe";

export const POST = async (req: Request, res: Response) => {
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
    res.json(return_data ? { links: result } : { message: "success" });
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const GET = async (req: Request, res: Response) => {
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
