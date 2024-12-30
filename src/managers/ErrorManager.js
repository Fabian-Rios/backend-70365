export default class ErrorManager extends Error {
    constructor(message, code) {
        super(message); 

        this.code = code || 500;
        this.name = this.constructor.name;
    }
}
