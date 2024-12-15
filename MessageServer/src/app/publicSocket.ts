import { Server as httpServer } from "http";
import { Server, Socket } from "socket.io";
import { ZEROMQ_CONFIG } from "../config/zeromq";
import { ChatPublisher } from "./chat/chatPublisher";
import { ChatSubscriptionsManager } from "./chat/chatSubscriptionsManager";
import databaseManager from "./database/databaseManager";
import { DatabaseSubscriber } from "./database/databaseSubscriber";

export class PublicSocket {
  private ioServer: Server;
  private chatPublisher: ChatPublisher;
  private chatSubscriptionsManager: ChatSubscriptionsManager;
  private databaseSubscription: DatabaseSubscriber;
  constructor(httpServer: httpServer) {
    this.ioServer = new Server(httpServer, {
      cors: {
        origin: "*", // Allow your frontend's origin
        methods: ["GET", "POST"], // HTTP methods allowed
      },
    });
    this.chatPublisher = new ChatPublisher(ZEROMQ_CONFIG.pubAddress);
    this.chatSubscriptionsManager = new ChatSubscriptionsManager();
    this.databaseSubscription = new DatabaseSubscriber(
      ZEROMQ_CONFIG.pubAddress
    );
    this.handleConnections();
  }

  handleConnections() {
    this.ioServer.on("connection", (socket: Socket) => {
      console.log(`Socket.IO client connected: ${socket.id}`);

      // Receive message from the client and publish it to NATS
      socket.on("sendMessage", (msg) => {
        const { payload, channel } = msg;
        if (payload && channel) {
          this.chatPublisher.publish(channel, payload);
        }
      });

      socket.on("joinChannel", (data) => {
        const { channel } = data;
        if (channel) {
          this.chatSubscriptionsManager.subscribeToChannel(
            socket.id,
            socket,
            channel
          );
        }
      });

      socket.on("loadPreviousMessages", (data) => {
        const { channel, lastMessageTimeStamp } = data;

        const messages = databaseManager.getPreviousMessages(
          lastMessageTimeStamp,
          channel
        );
        socket.emit("previousMessages", messages);
      });

      // Handle client disconnection
      socket.on("disconnect", () => {
        this.chatSubscriptionsManager.unsubscribeToAll(socket.id);
        console.log(`Socket.IO client disconnected: ${socket.id}`);
      });
    });
  }
}
