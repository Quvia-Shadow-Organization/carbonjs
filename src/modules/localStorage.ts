import LSContent from './localStorageContentInterface.d';


export class Storage {
    private readonly key: string;
    private contentCache?: LSContent;
    constructor(key = "stroage") {
        this.key = key;
    }
    get content(): LSContent {
        if (this.contentCache) return this.contentCache;
        var str = localStorage.getItem(this.key) || "{}";
        try {
            const obj = JSON.parse(str);
            this.contentCache = obj;
            return obj;
        } catch (e) {
            console.warn("Storage error. Resetting storage.");
            localStorage.removeItem(this.key);
            this.contentCache = undefined;
            return this.content;
        }
    }
    set content(content: LSContent) {
        this.contentCache = content;
    }
    save(): void {
        try {
            const str = JSON.stringify(this.contentCache);
            localStorage.setItem(this.key, str);
        } catch (e) {
            console.warn("Storage error. Cannot convert content to JSON. Storage did not save.");
        }
    }
}
export const storage = new Storage();
window.addEventListener("beforeunload", () => {
    storage.save();
});