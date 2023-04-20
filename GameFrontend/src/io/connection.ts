import * as signalR from "@microsoft/signalr";

type ServerOutgoingMessages = "Move" | "Stop" | "NewMessage";
type ServerIncomingMessages =
    | "PlayerJoined"
    | "PlayerLeft"
    | "PlayerMoved"
    | "OnConnected"
    | "MessageReceived";

export default class Connection {
    private readonly connection: signalR.HubConnection;
    public connected: boolean = false;
    public messageQueue: [ServerIncomingMessages, any[]][] = [];

    constructor(hubRoute: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubRoute)
            .build();

        this.#initQueueSources();
    }

    #initQueueSources = () => {
        this.addIncomingToQueue("MessageReceived");
        this.addIncomingToQueue("OnConnected");
        this.addIncomingToQueue("PlayerJoined");
        this.addIncomingToQueue("PlayerLeft");
        this.addIncomingToQueue("PlayerMoved");
    };

    public start: () => Promise<void> = async () => {
        await this.connection.start();
        this.connected = true;
    };

    public send: (
        type: ServerOutgoingMessages,
        ...args: any[]
    ) => Promise<void> = async (type, ...args) => {
        await this.connection.send(type, ...args);
    };

    public getConnectionId = () => {
        return this.connection.connectionId;
    };

    private addIncomingToQueue(methodName: ServerIncomingMessages) {
        this.connection.on(methodName, (...args) => {
            this.messageQueue.push([methodName, args]);
        });
    }
}
