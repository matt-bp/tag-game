import * as signalR from "@microsoft/signalr";

type ServerOutgoingMessages = "Move" | "Stop" | "NewMessage";
type ServerIncomingMessages = "PlayerLeft" | "PlayerMoved" | "MessageReceived";

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
        this.addIncomingToQueue("PlayerLeft");
        this.addIncomingToQueue("PlayerMoved");
    };

    public start: () => Promise<void> = async () => {
        try {
            await this.connection.start();
            this.connected = true;
        } catch (err: any) {
            document.write(err);
        }
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
            if (args[0] == this.getConnectionId()) return; // If we're getting a message about ourselves, ignore it

            this.messageQueue.push([methodName, args]);
        });
    }
}
