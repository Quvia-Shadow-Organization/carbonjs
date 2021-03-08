export abstract class Permissions {
    abstract toJSON(): any;
    abstract update(...args: any[]): void;
}
export class InfoPermissions extends Permissions {
    read?: boolean;
    edit?: boolean;
    constructor(read?: boolean, edit?: boolean) {
        super();
        this.edit = edit;
        this.read = read;
    }
    update(read: boolean, edit: boolean): void {
        this.edit = edit;
        this.read = read;
    }
    toJSON(): any {
        return {
            edit: this.edit,
            read: this.read
        }
    }
}
export interface PermissionsJSON {
    readInfo: boolean;
    editInfo: boolean;
}