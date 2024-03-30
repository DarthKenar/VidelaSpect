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