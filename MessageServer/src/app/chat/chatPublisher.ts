import crypto from "crypto";
import { Publisher } from "zeromq";
import { MessagePayload } from "../../types/message";
import { Message } from "../database/models/messages";

export class ChatPublisher {
  private pub: Publisher = new Publisher();
  constructor(address: string) {
    this.pub.bind(address);
  }

  public publish(topic: string, message: MessagePayload) {
    console.log("Message sent: ", topic, message);
    const idMessage: Message = {
      id: crypto.randomUUID(),
      channel: topic,
      ...message,
    };
    this.pub.send([topic, JSON.stringify(idMessage)]);
  }
}
