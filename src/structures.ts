import http from './modules/http';
import * as constants from './modules/constants';

declare type EventArgs = Array<any>;
declare type EventCallback = (...args: EventArgs) => void;
declare type UserEvent = "login" | "error";
declare type UserErrorOrigin = "login" | "changePassword" | "updateUUID" | "saveColorTheme" | "fetchColorTheme";
export class User {
    authorized: boolean = false;
    uuid?: string;
    verificationKey?: string;
    readonly colorTheme: ColorTheme;
    readonly httpClient: http.Client;
    private readonly eventCallbacks: eventCallbacks<EventCallback> = {};
    constructor() {
        this.httpClient = new http.Client({}, constants.url);
        this.colorTheme = new ColorTheme(this);
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

export class ColorTheme {
    readonly user: User;
    colors: Array<Color> = [];
    constructor(user: User) {
        this.user = user;
    }
    async fetch(): Promise<ColorTheme> {
        const r = await this.user.httpClient.get("/api/me/colorTheme/");
        if (!r.success) {
            this.user.emit("error", "fetchColorTheme", r.code, r.msg);
            return this;
        }
        this.updateWithJSON(r.body);
        return this;
    }
    async save(): Promise<boolean> {
        const r = await this.user.httpClient.post("/api/me/colorTheme", this.toJSON());
        if (!r.success) this.user.emit("error", "saveColorTheme", r.code, r.msg);
        return r.success;
    }

    private toJSON(): JSONColorTheme {
        return this.colors.map(c => c.toJSON());
    }
    private updateWithJSON(json: JSONColorTheme): void {
        if (!(json instanceof Array)) return;
        json.forEach((v, i) => {
            if (!this.colors[i]) this.colors[i] = Color.default;
            this.colors[i].updateWithJSON(json[i])
        })
    }
}
export class Color {
    r: number;
    g: number;
    b: number;
    a?: number;
    constructor(r: number, g: number, b: number, a?: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        if (a) this.a = a;
    }
    toJSONString(): string {
        return JSON.stringify(this.toJSON());
    }
    toJSON(): JSONColor {
        return { r: this.r, g: this.g, b: this.b, a: this.a };
    }
    toRGBA(): string {
        return `rgba{${this.r * 255}, ${this.g * 255}, ${this.b * 255}, ${(this.a || 1) * 255}}`;
    }
    toHEX(precision: number): string {
        var l = 16 ** precision - 1;
        var r = Math.round(this.r * l).toString(16);
        var g = Math.round(this.r * l).toString(16);
        var b = Math.round(this.r * l).toString(16);
        return "#" + r + g + b;
    }
    updateWithJSON(json: JSONColor): boolean {
        if (typeof json != "object") return false;
        this.r = json.r;
        this.g = json.g;
        this.b = json.b;
        if (json.a) this.a = json.a;
        return true;
    }
    static fromHEX(hexString: string): Color {
        if (hexString.startsWith("#")) hexString = hexString.substr(1);
        var r: number, g: number, b: number;
        if (hexString.length % 3 == 0) {
            var cl = hexString.length / 3;
            console.log(parseInt(hexString.slice(0, cl), 16));
            r = parseInt(hexString.slice(0, cl), 16) / (16 ** cl);
            g = parseInt(hexString.slice(cl, 2 * cl), 16) / (16 ** cl);
            b = parseInt(hexString.slice(cl * 2, cl * 3), 16) / (16 ** cl);
            return new Color(r, g, b);
        } else {
            return Color.default;
        }
    }
    static default = new Color(0, 0, 0);
}
interface eventCallbacks<C> {
    [event: string]: Array<C>;
}
type JSONColor = { r: number, g: number, b: number, a?: number };
type JSONColorTheme = Array<JSONColor>;