export default class ErrorManager extends Error {
    constructor(message, code) {
        super(message); // Llama al constructor de la clase Error

        this.code = code || 500; // Asigna el código de error, por defecto 500
        this.name = this.constructor.name; // Establece el nombre del error como el nombre de la clase
    }
}
