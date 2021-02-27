import http from './modules/http';
import constants from './modules/constants';

declare type EventArgs = Array<any>;
declare type EventCallback = (...args: EventArgs) => void;
declare type UserEvent = "login" | "error";
declare type UserErrorOrigin = "login" | "changePassword" | "updateUUID";
export class User {
    authorized: boolean = false;
    uuid?: string;
    verificationKey?: string;
    readonly httpClient: http.Client;
    private readonly eventCallbacks: eventCallbacks<EventCallback> = {};
    constructor() {
        this.httpClient = new http.Client({}, constants.url);
    }
    //! METHODS
    async login(email: string, password: string): Promise<boolean> {
        var r = await this.httpClient.post("/api/login/", { email, password });
        if (!r.success) {
            this.emit("error", "login", r.code, r.msg);
            return false;
        }
        this.authorized = true;
        this.uuid = r.body.uuid;
        this.verificationKey = r.body.verificationKey;
        this.updateHeaders();
        return false;
    }
    async changePassword(newPassword: string): Promise<boolean> {
        if (!this.authorized) return false;
        var r = await this.httpClient.post("/api/me/password/", { password: newPassword });
        if (!r.success) {
            this.emit("error", "changePassword", r.code, r.msg);
            return false;
        }
        return true;
    }


    //! EVENTS
    emit(event: "error", origin: UserErrorOrigin, code: http.unsuccessCode, message: string): void;
    emit(event: "login"): void;
    emit(event: UserEvent, ...args: EventArgs): void {
        if (!this.eventCallbacks[event]) this.eventCallbacks[event] = [];
        for (const cb of this.eventCallbacks[event]) {
            cb(...args);
        }
    }

    on(event: "error", callback: (origin: UserErrorOrigin, code: http.unsuccessCode, message: string) => void): void;
    on(event: "login", callback: () => void): void;
    on(event: UserEvent, callback: EventCallback): void {
        if (!this.eventCallbacks[event]) this.eventCallbacks[event] = [];
        this.eventCallbacks[event].push(callback);
    }

    remove(event: "error", callback: (origin: UserErrorOrigin, code: http.unsuccessCode, message: string) => void): boolean;
    remove(event: "login", callback: () => void): boolean;
    remove(event: UserEvent, callback: EventCallback): boolean {
        if (!this.eventCallbacks[event]) this.eventCallbacks[event] = [];
        var i = this.eventCallbacks[event].indexOf(callback);
        if (i == -1) return false;
        this.eventCallbacks[event].slice(i);
        return true;

    }

    //! PRIVATES METHODS
    private updateHeaders(): void {
        this.httpClient.headers = {
            "carbon-uuid": this.uuid,
            "carbon-verificationkey": this.verificationKey
        };
    }
    private async updateUUID(): Promise<boolean> {
        const r = await this.httpClient.get("/api/me/uuid/");
        if (!r.success) {
            this.emit("error", "updateUUID", r.code, r.msg);
            return false;
        }
        this.updateHeaders();
        return true;
    }
    //! STATIC METHODS
    static async register(email: string, password: string): Promise<boolean> {
        const r = await http.post({}, constants.url, {
            email, password
        });
        if (!r.success) {
            return false;
        }
        return true;
    }

}
interface eventCallbacks<C> {
    [event: string]: Array<C>;
}