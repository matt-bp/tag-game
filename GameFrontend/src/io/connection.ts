import * as signalR from "@microsoft/signalr";

export default class Connection {
    private readonly connection: signalR.HubConnection;
    public username: string = "";
    public connected: boolean = false;

    constructor(hubRoute: string) {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubRoute)
            .build();
    }
}
