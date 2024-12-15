import { Socket } from "socket.io";
import { CustomSubscriber } from "../shared/customSubscriber";

export class ChannelSubscriber extends CustomSubscriber {
  private clients: Map<string, Socket> = new Map();

  constructor(host: string, topic: string) {
    super(host, topic);
  }

  public addClient(clientId: string, socket: Socket) {
    this.clients.set(clientId, socket);
  }

  public removeClient(clientId: string) {
    this.clients.delete(clientId);
  }

  async processMessages() {
    // Read messages in a loop
    for await (const [topic, msg] of this.sub) {
      console.log(
        `Received from ZeroMQ - Topic: ${topic.toString()}, Message: ${msg.toString()}`
      );

      const message = JSON.parse(msg.toString());

      this.clients.forEach((clientSocket) => {
        clientSocket.emit("message", message);
      });
    }
  }
}
