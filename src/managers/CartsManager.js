import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";

export default class CartsManager {
    #jsonFilename;
    #carts;

    constructor() {
        this.#jsonFilename = "hardwares.json"; 
        this.#carts = [];
    }

    async #findOneById(id) {
        this.#carts = await this.getAll();
        const cartFound = this.#carts.find((item) => item.id === Number(id));

        if (!cartFound) {
            throw new Error(`Carrito con ID ${id} no encontrado`);
        }

        return cartFound;
    }

    async getAll() {
        try {
            this.#carts = await readJsonFile(paths.files, this.#jsonFilename);
            return this.#carts;
        } catch (error) {
            throw new Error(`Error al leer los carritos: ${error.message}`);
        }
    }

    async getOneById(id) {
        try {
            return await this.#findOneById(id);
        } catch (error) {
            throw new Error(`Error al obtener carrito con ID ${id}: ${error.message}`);
        }
    }

    async insertOne() {
        try {
            const cart = {
                id: generateId(await this.getAll()), 
                products: [],
            };

            this.#carts.push(cart);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);

            return cart;
        } catch (error) {
            throw new Error(`Error al crear el carrito: ${error.message}`);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await this.#findOneById(cartId);

            const existingProduct = cart.products.find((item) => item.product === Number(productId));
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ product: Number(productId), quantity });
            }

            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
            return cart;
        } catch (error) {
            throw new Error(`Error al agregar producto al carrito con ID ${cartId}: ${error.message}`);
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await this.#findOneById(cartId);

            const product = cart.products.find((item) => item.product === Number(productId));
            if (!product) {
                throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
            }

            product.quantity = quantity;

            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
            return cart;
        } catch (error) {
            throw new Error(`Error al actualizar cantidad del producto en carrito con ID ${cartId}: ${error.message}`);
        }
    }

    async updateCart(cartId, products) {
        try {
            const cart = await this.#findOneById(cartId);

            cart.products = products;

            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
            return cart;
        } catch (error) {
            throw new Error(`Error al actualizar carrito con ID ${cartId}: ${error.message}`);
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await this.#findOneById(cartId);

            cart.products = cart.products.filter((item) => item.product !== Number(productId));

            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
            return cart;
        } catch (error) {
            throw new Error(`Error al eliminar producto del carrito con ID ${cartId}: ${error.message}`);
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await this.#findOneById(cartId);

            cart.products = [];

            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
            return cart;
        } catch (error) {
            throw new Error(`Error al vaciar carrito con ID ${cartId}: ${error.message}`);
        }
    }

    async deleteCartById(id) {
        try {
            const cartIndex = this.#carts.findIndex((cart) => cart.id === Number(id));
            if (cartIndex === -1) {
                throw new Error(`Carrito con ID ${id} no encontrado`);
            }

            const deletedCart = this.#carts.splice(cartIndex, 1);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);

            return deletedCart;
        } catch (error) {
            throw new Error(`Error al eliminar carrito con ID ${id}: ${error.message}`);
        }
    }
}
