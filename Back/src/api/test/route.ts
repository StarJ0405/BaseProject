import { Request, Response } from "express";

export const GET = (req: Request, res: Response) => {

    return res.json(
        { id: 1, name: 'Laptop' },
    );
}