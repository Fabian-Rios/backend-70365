import paths from "../utils/paths.js"; 
import { readJsonFile, writeJsonFile, deleteFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import { convertToBoolean } from "../utils/converter.js";
import ErrorManager from "./ErrorManager.js";

export default class ProductsManager {
    #jsonFilename;
    #products;

    constructor() {
        this.#jsonFilename = "products.json"; 
        this.#products = [];
    }

    async #findOneById(id) {
        this.#products = await this.getAll();
        const productFound = this.#products.find((item) => item.id === Number(id));

        if (!productFound) {
            throw new ErrorManager(`Producto con ID ${id} no encontrado`, 404);
        }

        return productFound;
    }

    async getAll() {
        try {
            this.#products = await readJsonFile(paths.files, this.#jsonFilename);
            return this.#products;
        } catch (error) {
            throw new Error(`Error al leer los productos: ${error.message}`);
        }
    }
    

    async getOneById(id) {
        try {
            const productFound = await this.#findOneById(id);
            return productFound;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async insertOne(data, file) {
        try {
            const { title, status, stock } = data;
    
            if (!title || status === undefined || stock === undefined) {
                throw new ErrorManager("Faltan datos obligatorios: title, status o stock", 400);
            }
    
            const product = {
                id: generateId(await this.getAll()), 
                title: title.trim(), 
                status: convertToBoolean(status), 
                stock: Number(stock),
                thumbnail: file?.filename ?? null 
            };
    
            if (isNaN(product.stock) || product.stock < 0) {
                throw new ErrorManager("El stock debe ser un número mayor o igual a 0", 400);
            }
    
            this.#products.push(product);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products);
    
            return product;
        } catch (error) {

            if (file?.filename) await deleteFile(paths.images, file.filename);
            throw new ErrorManager(`Error al insertar producto: ${error.message}`, error.code || 500);
        }
    }
    

    async updateOneById(id, data, file) {
        try {
            const { title, status, stock } = data;
            const productFound = await this.#findOneById(id);
            const newThumbnail = file?.filename;

            const product = {
                id: productFound.id,
                title: title || productFound.title,
                status: status !== undefined ? convertToBoolean(status) : productFound.status,
                stock: stock !== undefined ? Number(stock) : productFound.stock,
                thumbnail: newThumbnail || productFound.thumbnail,
            };

            const index = this.#products.findIndex((item) => item.id === Number(id));
            this.#products[index] = product;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products);

            if (file?.filename && newThumbnail !== productFound.thumbnail) {
                await deleteFile(paths.images, productFound.thumbnail);
            }

            return product;
        } catch (error) {
            if (file?.filename) await deleteFile(paths.images, file.filename);
            throw new ErrorManager(error.message, error.code);
        }
    }

    async deleteOneById(id) {
        try {
            const productFound = await this.#findOneById(id);

            if (productFound.thumbnail) {
                await deleteFile(paths.images, productFound.thumbnail);
            }

            const index = this.#products.findIndex((item) => item.id === Number(id));
            this.#products.splice(index, 1);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#products);
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    async getTotalProducts(query = "") {
        try {
            const allProducts = await this.getAll({});
            const filteredProducts = query
                ? allProducts.filter((product) =>
                    product.title.toLowerCase().includes(query.toLowerCase())
                )
                : allProducts;
            return filteredProducts.length;
        } catch (error) {
            throw new ErrorManager(error.message, error.code);
        }
    }

    
}
