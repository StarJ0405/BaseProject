import { Link } from "models/link";
import { EntitySubscriberInterface, EventSubscriber } from "typeorm";

@EventSubscriber()
export class LinkSubscriber implements EntitySubscriberInterface<Link> {
  listenTo(): Function | string {
    return Link;
  }
}
