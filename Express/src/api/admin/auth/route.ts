import { ApiHandler } from "app";
import { UserService } from "services/user";
import { container } from "tsyringe";
import { generateToken } from "utils/functions";

export const POST: ApiHandler = async (req, res) => {
  const { user_name, password, keep = false } = req.body;
  if (!user_name || !password) {
    res.status(404).json({
      message: "something is wrong!",
    });
    return;
  }
  const service = container.resolve(UserService);
  const user = await service.auth(String(user_name), String(password));
  if (!user) {
    res.status(404).json({ message: "not correct" });
    return;
  }
  res.json({
    access_token: generateToken(
      {
        user_id: user.id,
        keep,
      },
      keep
        ? {
            expiresIn: "31d",
          }
        : {}
    ),
  });
};
