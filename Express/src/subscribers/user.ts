import { User } from "models/user";
import { EntitySubscriberInterface, EventSubscriber } from "typeorm";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo(): Function | string {
    return User;
  }
}
