import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile, deleteFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import { convertToBoolean } from "../utils/converter.js";
import ErrorManager from "./ErrorManager.js";

export default class ComponentsManager {
    #jsonFilename;
    #components;

    constructor() {
        this.#jsonFilename = "components.json";
    }

    // Busca un componente por su ID
    async #findOneById(id) {
        this.#components = await this.getAll();
        const componentsFound = this.#components.find((item) => item.id === Number(id));

        if (!componentsFound) {
            throw new ErrorManager("ID no encontrado", 404);
        }

        return componentsFound;
    }

    // Obtiene una lista de componentes
    async getAll() {
        try {
            this.#components = await readJsonFile(paths.files, this.#jsonFilename);
            return this.#components;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    // Obtiene un componente específico por su ID
    async getOneById(id) {
        try {
            const componentsFound = await this.#findOneById(id);
            return componentsFound;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    // Inserta un componente
    async insertOne(data, file) {
        try {
            const { title, status, stock } = data;

            if (!title || !status || !stock ) {
                throw new ErrorManager("Faltan datos obligatorios", 400);
            }

            const component = {
                id: generateId(await this.getAll()),
                title,
                status: convertToBoolean(status),
                stock: Number(stock),
                thumbnail: file?.filename ?? null
            };

            this.#components.push(component);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#components);

            return component;
        } catch (error) {
            if (file?.filename) await deleteFile(paths.images, file.filename); // Elimina la imagen si ocurre un error
            throw new ErrorManager(error.message, error.code);
        }
    }

    // Actualiza un componente en específico
    async updateOneById(id, data, file) {
        try {
            const { title, status, stock } = data;
            const componentsFound = await this.#findOneById(id);
            const newThumbnail = file?.filename;

            const component = {
                id: componentsFound.id,
                title: title || componentsFound.title,
                status: status ? convertToBoolean(status) : componentsFound.status,
                stock: stock ? Number(stock) : componentsFound.stock,
                thumbnail: newThumbnail || componentsFound.thumbnail,
            };

            const index = this.#components.findIndex((item) => item.id === Number(id));
            this.#components[index] = component;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#components);

            // Elimina la imagen anterior si es distinta de la nueva
            if (file?.filename && newThumbnail !== componentsFound.thumbnail) {
                await deleteFile(paths.images, componentsFound.thumbnail);
            }

            return component;
        } catch (error) {
            if (file?.filename) await deleteFile(paths.images, file.filename); // Elimina la imagen si ocurre un error
            throw new ErrorManager(error.message, error.code);
        }
    }

    // Elimina un componente en específico
    async deleteOneById (id) {
        try {
            const componentsFound = await this.#findOneById(id);

            // Si tiene thumbnail definido, entonces, elimina la imagen del componente
            if (this.componentsFound.thumbnail) {
                await deleteFile(paths.images, this.componentsFound.thumbnail);
            }

            const index = this.#components.findIndex((item) => item.id === Number(id));
            this.#components.splice(index, 1);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#components);
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }
}