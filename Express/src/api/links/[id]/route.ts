import { Request, Response } from "express";
import { Link } from "models/link";
import { LinkService } from "services/link";
import { container } from "tsyringe";

export const POST = async (req: Request, res: Response) => {
  const { id } = req.params;
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
    const _data = { start_date, end_date, chance, data, metadata };
    const result: UpdateResult<Link> = await service.update(
      { id: id },
      _data,
      true
    );
    res.json(result);
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const GET = async (req: Request, res: Response) => {
  const { id } = req.params;

  const service: LinkService = container.resolve(LinkService);

  const content = await service.getById(id);
  res.json({ content });
};
