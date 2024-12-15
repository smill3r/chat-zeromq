import { Socket } from "socket.io";
import { Subscriber } from "zeromq";

export class CustomSubscriber {
  protected sub = new Subscriber();

  constructor(host: string, topic?: string) {
    this.initialize(host, topic);
    this.processMessages();
  }

  private initialize(host: string, topic?: string) {
    this.sub.connect(host);
    if (topic) {
      this.sub.subscribe(topic);
    } else {
      this.sub.subscribe();
    }
  }

  async processMessages() {
    // Read messages in a loop
    for await (const [topic, msg] of this.sub) {
      console.log(
        `Received from ZeroMQ - Topic: ${topic.toString()}, Message: ${msg.toString()}`
      );
    }
  }
}

type EmitMethod = Socket["emit"];
