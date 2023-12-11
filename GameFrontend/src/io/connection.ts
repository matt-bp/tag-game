import * as signalR from "@microsoft/signalr";
import { Direction } from "../helpers/direction";

type ServerOutgoingMessages = "Move" | "Stop" | "NewUsername";
type ServerIncomingMessages = "PlayerLeft" | "PlayerMoved" | "ServerMessage";

export type ArgsToIncomingMessages = {
    PlayerLeft: [string];
    PlayerMoved: [string, string, number, number, Direction, boolean, boolean];
    ServerMessage: [string];
};

export default class Connection {
    private readonly connection: signalR.HubConnection;
    public connected: boolean = false;
    public messageQueue: [ServerIncomingMessages, any[]][] = [];

    constructor(hubRoute: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubRoute)
            .build();
    }

    #initQueueSources = () => {
        this.addIncomingToQueue("PlayerLeft");
        this.addIncomingToQueue("PlayerMoved");
        this.addIncomingToQueue("ServerMessage");
    };

    public start: () => Promise<void> = async () => {
        await this.connection.start();
        this.connected = true;
        this.#initQueueSources();
    };

    public end: () => Promise<void> = async () => {
        await this.connection.stop();
        this.connected = false;
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
            if (
                methodName != "PlayerMoved" &&
                args[0] == this.getConnectionId()
            )
                return; // If we're getting a message about ourselves, ignore it

            this.messageQueue.push([methodName, args]);
        });
    }
}
