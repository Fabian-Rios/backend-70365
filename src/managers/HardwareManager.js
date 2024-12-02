import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";

export default class HardwareManager {
    #jsonFilename;
    #hardwares;

    constructor() {
        this.#jsonFilename = "hardwares.json";
    }

    // Busca un receta por su ID
    async #findOneById(id) {
        this.hardware = await this.getAll();
        const hardwareFound = this.hardware.find((item) => item.id === Number(id));

        if (!hardwareFound) {
            throw new ErrorManager("ID no encontrado", 404);
        }

        return hardwareFound;
    }

    // Obtiene una lista de recetas
    async getAll() {
        try {
            this.hardware = await readJsonFile(paths.files, this.#jsonFilename);
            return this.hardware;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    // Obtiene un receta específica por su ID
    async getOneById(id) {
        try {
            const hardwareFound = await this.#findOneById(id);
            return hardwareFound;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    // Inserta un receta
    async insertOne(data) {
        try {
            const components = data?.components?.map((item) => {
                return { component: Number(item.component), quantity: 1 };
            });

            const hardware = {
                id: generateId(await this.getAll()),
                components: components ?? [],
            };

            this.hardware.push(hardware);
            await writeJsonFile(paths.files, this.#jsonFilename, this.hardware);

            return hardware;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    // Agrega un ingrediente a una receta o incrementa la cantidad de un ingrediente existente
    addOneIngredient = async (id, componentId) => {
        try {
            const hardwareFound = await this.#findOneById(id);
            const componentIndex = hardwareFound.components.findIndex((item) => item.component === Number(componentId));

            if (componentIndex >= 0) {
                hardwareFound.components[componentIndex].quantity++;
            } else {
                hardwareFound.components.push({ component: Number(componentId), quantity: 1 });
            }

            const index = this.hardware.findIndex((item) => item.id === Number(id));
            this.hardware[index] = hardwareFound;
            await writeJsonFile(paths.files, this.#jsonFilename, this.hardware);

            return hardwareFound;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    };
}