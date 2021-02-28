
export function get(headers: any, url: string): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        const r = new XMLHttpRequest();
        for (var k in headers) {
            r.setRequestHeader(k, headers[k]);
        }
        r.onreadystatechange = ev => {
            if (r.readyState == 4) {
                const code: any = r.status;
                const resp = JSON.parse(r.responseText);

                if (resp.success) {
                    resolve({
                        success: true,
                        code,
                        body: resp.body
                    });
                } else {
                    resolve({
                        success: false,
                        code,
                        msg: resp.msg
                    })
                }
            }
        }
        r.open("GET", url);
    });
}
export function del(headers: any, url: string): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        const r = new XMLHttpRequest();
        for (var k in headers) {
            r.setRequestHeader(k, headers[k]);
        }
        r.onreadystatechange = ev => {
            if (r.readyState == 4) {
                const code: any = r.status;
                const resp = JSON.parse(r.responseText);

                if (resp.success) {
                    resolve({
                        success: true,
                        code,
                        body: resp.body
                    });
                } else {
                    resolve({
                        success: false,
                        code,
                        msg: resp.msg
                    })
                }
            }
        }
        r.open("DELETE", url);
    });
}
export function post(headers: any, url: string, data: any): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        const r = new XMLHttpRequest();
        for (var k in headers) {
            r.setRequestHeader(k, headers[k]);
        }
        r.onreadystatechange = ev => {
            if (r.readyState == 4) {
                const code: any = r.status;
                const resp = JSON.parse(r.responseText);

                if (resp.success) {
                    resolve({
                        success: true,
                        code,
                        body: resp.body
                    });
                } else {
                    resolve({
                        success: false,
                        code,
                        msg: resp.msg
                    })
                }
            }
        }
        r.open("POST", url);
        r.send(JSON.stringify(data));
    });
}
export function put(headers: any, url: string, data: any): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        const r = new XMLHttpRequest();
        for (var k in headers) {
            r.setRequestHeader(k, headers[k]);
        }
        r.onreadystatechange = ev => {
            if (r.readyState == 4) {
                const code: any = r.status;
                const resp = JSON.parse(r.responseText);

                if (resp.success) {
                    resolve({
                        success: true,
                        code,
                        body: resp.body
                    });
                } else {
                    resolve({
                        success: false,
                        code,
                        msg: resp.msg
                    })
                }
            }
        }
        r.open("PUT", url);
        r.send(JSON.stringify(data));
    });
}
export function patch(headers: any, url: string, data: any): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        const r = new XMLHttpRequest();
        for (var k in headers) {
            r.setRequestHeader(k, headers[k]);
        }
        r.onreadystatechange = ev => {
            if (r.readyState == 4) {
                const code: any = r.status;
                const resp = JSON.parse(r.responseText);

                if (resp.success) {
                    resolve({
                        success: true,
                        code,
                        body: resp.body
                    });
                } else {
                    resolve({
                        success: false,
                        code,
                        msg: resp.msg
                    })
                }
            }
        }
        r.open("PATCH", url);
        r.send(JSON.stringify(data));
    });
}
export class Client {
    headers: any;
    readonly url: string;
    constructor(headers: any, url: string) {
        this.headers = headers;
        if (url.endsWith("/")) this.url = url; else this.url = url + '/';
    }
    private formatRelativeUrl(url: string): string {
        if (url.startsWith("/")) return url.substring(1); else return url;
    }
    private urlif(url: string): string {
        return this.url + this.formatRelativeUrl(url);
    }
    async get(relativeUrl: string): Promise<Response> {
        return await get(this.headers, this.urlif(relativeUrl));
    }
    async del(relativeUrl: string): Promise<Response> {
        return await del(this.headers, this.urlif(relativeUrl));
    }
    async post(relativeUrl: string, data: any): Promise<Response> {
        return await post(this.headers, this.urlif(relativeUrl), data);
    }
    async put(relativeUrl: string, data: any): Promise<Response> {
        return await put(this.headers, this.urlif(relativeUrl), data);
    }
    async patch(relativeUrl: string, data: any): Promise<Response> {
        return await patch(this.headers, this.urlif(relativeUrl), data);
    }
}
export interface SuccessfulResponse {
    code: successCode;
    success: true;
    body: any;
}
export interface UnsuccessfulResponse {
    code: unsuccessCode;
    success: false;
    msg: string;
}
export type Response = SuccessfulResponse | UnsuccessfulResponse;
export type successCode = 200;
export type unsuccessCode = 400 | 403 | 404 | 405 | 500;
export type code = successCode | unsuccessCode;
