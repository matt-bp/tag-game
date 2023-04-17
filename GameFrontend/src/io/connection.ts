import * as signalR from "@microsoft/signalr";

type ServerOutgoingMessages = "Move" | "Stop" | "NewMessage";
type ServerIncomingMessages =
    | "PlayerJoined"
    | "PlayerLeft"
    | "PlayerMoved"
    | "OnConnected"
    | "MessageReceived";

type Handler = (...args: any[]) => void;

export default class Connection {
    private readonly connection: signalR.HubConnection;
    public username: string = "";
    public connected: boolean = false;
    public messageQueue: [ServerIncomingMessages, any[]][] = [];
    #handlers: Record<ServerIncomingMessages, Handler | undefined> = {
        MessageReceived: undefined,
        OnConnected: undefined,
        PlayerJoined: undefined,
        PlayerLeft: undefined,
        PlayerMoved: undefined,
    };

    constructor(hubRoute: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubRoute)
            .build();

        this.#initConnectionHandlers();
    }

    #initConnectionHandlers = () => {
        this.connection.on("MessageReceived", (...args) => {
            this.messageQueue.push(["MessageReceived", args]);
        });

        this.connection.on("OnConnected", (...args) => {
            this.messageQueue.push(["OnConnected", args]);
        });

        this.connection.on("PlayerJoined", (...args) => {
            this.messageQueue.push(["PlayerJoined", args]);
        });

        this.connection.on("PlayerLeft", (...args) => {
            this.messageQueue.push(["PlayerLeft", args]);
        });

        this.connection.on("PlayerMoved", (...args) => {
            this.messageQueue.push(["PlayerMoved", args]);
        });
    };

    public start: () => Promise<void> = async () => {
        await this.connection.start();
        this.connected = true;
    };

    public send: <T extends ServerOutgoingMessages>(
        type: T,
        ...args: any[]
    ) => Promise<void> = async (type, ...args) => {
        await this.connection.send(type, ...args);
    };

    public on: <T extends ServerIncomingMessages>(
        type: T,
        handler: Handler
    ) => void = (type, handler) => {
        // this.#handlers[type] = handler;
        this.connection.on(type, handler);
    };

    public getConnectionId = () => {
        return this.connection.connectionId;
    };
}
