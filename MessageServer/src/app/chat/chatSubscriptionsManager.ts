import { Socket } from "socket.io";
import { ZEROMQ_CONFIG } from "../../config/zeromq";
import { ChannelSubscriber } from "../channel/channelSubscriber";

export class ChatSubscriptionsManager {
  private channelSubscriptions: Map<string, ChannelSubscriber> = new Map();
  private clientSubscriptions: Map<string, Set<string>> = new Map();

  constructor() {}

  public subscribeToChannel(clientId: string, socket: Socket, channel: string) {
    console.log("Trying to subscribe");
    const channelSubscription = this.channelSubscriptions.get(channel);
    if (!channelSubscription) {
      const subscriber = new ChannelSubscriber(
        ZEROMQ_CONFIG.pubAddress,
        channel
      );
      subscriber.addClient(socket.id, socket);
      this.channelSubscriptions.set(channel, subscriber);
    } else {
      console.log("Subscribed client to channel:", clientId, channel);
      channelSubscription.addClient(socket.id, socket);
    }
    this.storeClientSubscription(clientId, channel);
  }

  public unsubscribeToAll(clientId: string) {
    const clientSubscriptions = this.clientSubscriptions.get(clientId);
    clientSubscriptions?.forEach((channel) => {
      const channelSubscription = this.channelSubscriptions.get(channel);
      channelSubscription?.removeClient(clientId);
    });
  }

  private storeClientSubscription(clientId: string, channel: string) {
    let subscriptions = this.clientSubscriptions.get(clientId);
    if (subscriptions) {
      subscriptions.add(channel);
    } else {
      subscriptions = new Set([channel]);
    }
    this.clientSubscriptions.set(clientId, subscriptions);
  }
}
