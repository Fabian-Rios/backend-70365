import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";

export default class HardwareManager {
    #jsonFilename;
    #hardwares;

    constructor() {
        this.#jsonFilename = "hardwares.json";
        this.#hardwares = []; // Asegúrate de inicializar la propiedad
    }

    async #findOneById(id) {
        this.#hardwares = await this.getAll();
        const hardwareFound = this.#hardwares.find((item) => item.id === Number(id));

        if (!hardwareFound) {
            throw new ErrorManager("ID no encontrado", 404);
        }

        return hardwareFound;
    }

    async getAll() {
        try {
            this.#hardwares = await readJsonFile(paths.files, this.#jsonFilename);
            return this.#hardwares;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async getOneById(id) {
        try {
            const hardwareFound = await this.#findOneById(id);
            return hardwareFound;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async insertOne(data) {
        try {
            const components = data?.components?.map((item) => {
                return { component: Number(item.component), quantity: 1 };
            });

            const hardware = {
                id: generateId(await this.getAll()),
                components: components && components.length > 0 ? components : [],
            };

            this.#hardwares.push(hardware);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#hardwares);

            return hardware;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    addOneIngredient = async (id, componentId) => {
        try {
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
            throw new ErrorManager(error.message, error.code);
        }
    };
}
