import { CustomSubscriber } from "../shared/customSubscriber";
import databaseManager from "./databaseManager";

export class DatabaseSubscriber extends CustomSubscriber {
  constructor(host: string) {
    super(host);
  }

  async processMessages() {
    // Read messages in a loop
    for await (const [topic, msg] of this.sub) {
      console.log(
        `Sending message from channel ${topic.toString()} to database, message: ${msg.toString()}`
      );

      const message = JSON.parse(msg.toString());
      databaseManager.insertMessage(message);
    }
  }
}
