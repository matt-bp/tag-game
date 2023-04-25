import * as signalR from "@microsoft/signalr";
import { Direction } from "../helpers/direction";

type ServerOutgoingMessages = "Move" | "Stop";
type ServerIncomingMessages = "PlayerLeft" | "PlayerMoved";

export type ArgsToIncomingMessages = {
    PlayerLeft: [string];
    PlayerMoved: [string, number, number, Direction, boolean, boolean];
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
    };

    public start: () => Promise<void> = async () => {
        try {
            await this.connection.start();
            this.connected = true;
            this.#initQueueSources();
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
            if (
                methodName != "PlayerMoved" &&
                args[0] == this.getConnectionId()
            )
                return; // If we're getting a message about ourselves, ignore it

            this.messageQueue.push([methodName, args]);
        });
    }
}
