export interface Image {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }
  
export interface RootObject {
    validation: Validation;
}

export interface Validation {
    status: boolean;
    messages: Message[];
}

export interface Message {
    message: string;
    type: string;
}

export interface Authentication {
    auth: true;
    token: ""
}

export const error = [{
    message: "Ha ocurrido un error, por favor contacte al administrador",
    type: "error"
}]

export class ValidationClass implements Validation {
    status: boolean;
    messages: Message[];

    constructor() {
        this.status = true;
        this.messages = [];
    }

    addMessage(message: string, type: string) {
        this.messages.push({message, type});
    }
}
interface AiData {
    score: number;
    label: string;
  }

export class AiDataClass implements AiData {
    score: number;
    label: string;

    constructor(score: number, label: string) {
        this.score = score;
        this.label = label;
    }
}