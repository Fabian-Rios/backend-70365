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
        this.#components = [];
    }

    async #findOneById(id) {
        this.#components = await this.getAll();
        const componentsFound = this.#components.find((item) => item.id === Number(id));

        if (!componentsFound) {
            throw new ErrorManager("ID no encontrado", 404);
        }

        return componentsFound;
    }

    async getAll() {
        try {
            this.#components = await readJsonFile(paths.files, this.#jsonFilename);
            return this.#components;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async getOneById(id) {
        try {
            const componentsFound = await this.#findOneById(id);
            return componentsFound;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async insertOne(data, file) {
        try {
            const { title, status, stock } = data;

            if (!title || !status || !stock) {
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
            if (file?.filename) await deleteFile(paths.images, file.filename);
            throw new ErrorManager(error.message, error.code);
        }
    }

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

            if (file?.filename && newThumbnail !== componentsFound.thumbnail) {
                await deleteFile(paths.images, componentsFound.thumbnail);
            }

            return component;
        } catch (error) {
            if (file?.filename) await deleteFile(paths.images, file.filename);
            throw new ErrorManager(error.message, error.code);
        }
    }

    async deleteOneById(id) {
        try {
            const componentsFound = await this.#findOneById(id);

            if (componentsFound.thumbnail) {
                await deleteFile(paths.images, componentsFound.thumbnail);
            }

            const index = this.#components.findIndex((item) => item.id === Number(id));
            this.#components.splice(index, 1);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#components);
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async getTotalComponents(query = "") {
        try {
            const allComponents = await this.getAll();
            const filteredComponents = query
                ? allComponents.filter((component) =>
                    component.title.toLowerCase().includes(query.toLowerCase())
                )
                : allComponents;
            return filteredComponents.length;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }
}
