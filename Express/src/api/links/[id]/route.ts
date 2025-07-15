import { ApiHandler } from "app";
import { Link } from "models/link";
import { LinkService } from "services/link";
import { container } from "tsyringe";

export const POST: ApiHandler = async (req, res) => {
  const { id } = req.params;
  const {
    start_date,
    end_date,
    chance = 1,
    data,
    metadata,
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
    res.json(return_data ? { content: result } : { message: "success" });
  } catch (err) {
    res.status(500).send(err);
  }
};

export const GET: ApiHandler = async (req, res) => {
  const { id } = req.params;

  const service: LinkService = container.resolve(LinkService);

  const content = await service.getById(id);
  res.json({ content });
};
