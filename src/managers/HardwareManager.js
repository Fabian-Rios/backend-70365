import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";

export default class HardwareManager {
    #jsonFilename;
    #hardwares;

    constructor() {
        this.#jsonFilename = "hardwares.json";
        this.#hardwares = [];
    }

    async #findOneById(id) {
        if (!Number.isInteger(Number(id))) {
            throw new ErrorManager(`el ID debe ser un número válido: ${id}`, 400);
        }
        this.#hardwares = await this.getAll();
        const hardwareFound = this.#hardwares.find((item) => item.id === Number(id));

        if (!hardwareFound) {
            throw new ErrorManager(`hardware con ID ${id} no encontrado`, 404);
        }

        return hardwareFound;
    }

    async getAll() {
        try {
            this.#hardwares = await readJsonFile(paths.files, this.#jsonFilename);
            return this.#hardwares;
        } catch (error) {
            throw new ErrorManager(`error al leer los hardwares: ${error.message}`, error.code || 500);
        }
    }

    async getOneById(id) {
        try {
            return await this.#findOneById(id);
        } catch (error) {
            throw new ErrorManager(`error al obtener hardware con ID ${id}: ${error.message}`, error.code || 500);
        }
    }

    async insertOne(data) {
        try {
            if (!data || !Array.isArray(data.components)) {
                throw new ErrorManager("los componentes deben ser un array válido", 400);
            }

            const components = data.components.map((item) => ({
                component: Number(item.component),
                quantity: 1,
            }));

            const hardware = {
                id: generateId(await this.getAll()),
                components: components.length > 0 ? components : [],
            };

            this.#hardwares.push(hardware);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#hardwares);

            return hardware;
        } catch (error) {
            throw new ErrorManager(`error al insertar hardware: ${error.message}`, error.code || 500);
        }
    }

    async addOneIngredient(id, componentId) {
        try {
            if (!Number.isInteger(Number(id)) || !Number.isInteger(Number(componentId))) {
                throw new ErrorManager("ID y ComponentID deben ser números válidos", 400);
            }

            const hardwareFound = await this.#findOneById(id);
            const componentIndex = hardwareFound.components.findIndex((item) => item.component === Number(componentId));

            if (componentIndex >= 0) {
                hardwareFound.components[componentIndex].quantity++;
            } else {
                hardwareFound.components.push({ component: Number(componentId), quantity: 1 });
            }

            const index = this.#hardwares.findIndex((item) => item.id === Number(id));
            this.#hardwares[index] = hardwareFound;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#hardwares);

            return hardwareFound;
        } catch (error) {
            throw new ErrorManager(`error al agregar componente: ${error.message}`, error.code || 500);
        }
    }


    async deleteComponentFromCart(id, componentId) {
        try {
            const hardwareFound = await this.#findOneById(id);
            const componentIndex = hardwareFound.components.findIndex((item) => item.component === Number(componentId));
    
            if (componentIndex < 0) {
                throw new ErrorManager(`componente con ID ${componentId} no encontrado en el carrito`, 404);
            }
    
            hardwareFound.components.splice(componentIndex, 1);
    
            const index = this.#hardwares.findIndex((item) => item.id === Number(id));
            this.#hardwares[index] = hardwareFound;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#hardwares);
    
            return hardwareFound;
        } catch (error) {
            throw new ErrorManager(`error al eliminar componente: ${error.message}`, error.code || 500);
        }
    }

    async clearCart(id) {
        try {
            const hardwareFound = await this.#findOneById(id);
    
            hardwareFound.components = [];
    
            const index = this.#hardwares.findIndex((item) => item.id === Number(id));
            this.#hardwares[index] = hardwareFound;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#hardwares);
    
            return hardwareFound;
        } catch (error) {
            throw new ErrorManager(`error al vaciar carrito: ${error.message}`, error.code || 500);
        }
    }

    async updateProductQuantity(id, componentId, quantity) {
        try {
            if (!Number.isInteger(quantity) || quantity < 0) {
                throw new ErrorManager("la cantidad debe ser un número entero positivo", 400);
            }
    
            const hardwareFound = await this.#findOneById(id);
            const componentIndex = hardwareFound.components.findIndex((item) => item.component === Number(componentId));
    
            if (componentIndex < 0) {
                throw new ErrorManager(`componente con ID ${componentId} no encontrado en el carrito`, 404);
            }
    
            hardwareFound.components[componentIndex].quantity = quantity;
    
            const index = this.#hardwares.findIndex((item) => item.id === Number(id));
            this.#hardwares[index] = hardwareFound;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#hardwares);
    
            return hardwareFound;
        } catch (error) {
            throw new ErrorManager(`error al actualizar la cantidad: ${error.message}`, error.code || 500);
        }
    }
    
}
