import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";

import ProductsManager from "./ProductsManager.js";

const productsManager = new ProductsManager();


export default class CartsManager {
    #jsonFilename;
    #carts;

    constructor() {
        this.#jsonFilename = "carts.json";
        this.#carts = [];
    }

    async getTotalCarts(query = "") {
        try {
            const allCarts = await this.getAll();
            const filteredCarts = query
                ? allCarts.filter(cart =>
                    cart.products.some(product =>
                        product.title.toLowerCase().includes(query.toLowerCase())
                    )
                )
                : allCarts;
            return filteredCarts.length;
        } catch (error) {
            throw new ErrorManager(`Error al calcular el total de carritos: ${error.message}`, error.code);
        }
    }

    async #findOneById(id) {
        if (!Number.isInteger(Number(id))) {
            throw new ErrorManager(`El ID debe ser un número válido: ${id}`, 400);
        }
        this.#carts = await this.getAll();
        const cartFound = this.#carts.find((item) => item.id === Number(id));

        if (!cartFound) {
            throw new ErrorManager(`Carrito con ID ${id} no encontrado`, 404);
        }

        return cartFound;
    }

    async getAll() {
        try {
            this.#carts = await readJsonFile(paths.files, this.#jsonFilename);
            return this.#carts;
        } catch (error) {
            throw new ErrorManager(`Error al leer los carritos: ${error.message}`, error.code || 500);
        }
    }

    async getOneById(id) {
        try {
            return await this.#findOneById(id);
        } catch (error) {
            throw new ErrorManager(`Error al obtener carrito con ID ${id}: ${error.message}`, error.code || 500);
        }
    }

    async insertOne(data) {
        try {
            if (!data || !Array.isArray(data.products)) {
                throw new ErrorManager("Debes proporcionar un array de productos", 400);
            }
    
            const allProducts = await productsManager.getAll();
    
            const validatedProducts = data.products
                .map((item) => {
                    const productExists = allProducts.find(
                        (product) => product.id === Number(item.product)
                    );
    
                    if (!productExists) {
                        console.warn(`Producto con ID ${item.product} no existe. Ignorado.`);
                        return null;
                    }
    
                    return {
                        product: Number(item.product),
                        quantity: Number(item.quantity) || 1, 
                    };
                })
                .filter((item) => item !== null); 
    
      
            if (validatedProducts.length === 0) {
                throw new ErrorManager("Ninguno de los productos proporcionados es válido", 400);
            }
    

            const cart = {
                id: generateId(await this.getAll()),
                products: validatedProducts,
            };
    
          
            this.#carts.push(cart);
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
    
            return cart;
        } catch (error) {
            throw new ErrorManager(`Error al crear el carrito: ${error.message}`, error.code || 500);
        }
    }

    async addProductToCart(cartId, productId, quantity) {
        try {
            const cart = await this.#findOneById(cartId);
            const product = await productsManager.getOneById(productId);
    
            if (!product) throw new ErrorManager(`Producto con ID ${productId} no encontrado`, 404);
            if (product.stock < quantity) throw new ErrorManager(`Stock insuficiente para el producto ${productId}`, 400);
    
            const existingProductIndex = cart.products.findIndex((p) => p.product === productId);
    
            if (existingProductIndex >= 0) {

                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }
    
            product.stock -= quantity;
            await productsManager.updateOneById(productId, product);
    
            const cartIndex = this.#carts.findIndex((c) => c.id === cartId);
            this.#carts[cartIndex] = cart;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
    
            return cart;
        } catch (error) {
            throw new ErrorManager(`Error al agregar producto al carrito: ${error.message}`, error.code || 500);
        }
    }
    


    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await this.#findOneById(cartId);
            const product = await productsManager.getOneById(productId);
    
            const productIndex = cart.products.findIndex((p) => p.product === productId);
            if (productIndex < 0) throw new ErrorManager(`Producto con ID ${productId} no encontrado en el carrito`, 404);
    
            const quantityToRemove = cart.products[productIndex].quantity;
            cart.products.splice(productIndex, 1);
    
            product.stock += quantityToRemove;
            await productsManager.updateOneById(productId, product);
    
            const cartIndex = this.#carts.findIndex((c) => c.id === cartId);
            this.#carts[cartIndex] = cart;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
    
            return cart;
        } catch (error) {
            throw new ErrorManager(`Error al eliminar producto del carrito: ${error.message}`, error.code || 500);
        }
    }
    

    async clearCart(cartId) {
        try {
            const cartFound = await this.#findOneById(cartId);

            cartFound.products = [];

            const index = this.#carts.findIndex((item) => item.id === Number(cartId));
            this.#carts[index] = cartFound;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);

            return cartFound;
        } catch (error) {
            throw new ErrorManager(`Error al vaciar carrito: ${error.message}`, error.code || 500);
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (!Number.isInteger(quantity) || quantity < 0) {
                throw new ErrorManager("La cantidad debe ser un número entero positivo", 400);
            }

            const cartFound = await this.#findOneById(cartId);
            const productIndex = cartFound.products.findIndex((item) => item.product === Number(productId));

            if (productIndex < 0) {
                throw new ErrorManager(`Producto con ID ${productId} no encontrado en el carrito`, 404);
            }

            cartFound.products[productIndex].quantity = quantity;

            const index = this.#carts.findIndex((item) => item.id === Number(cartId));
            this.#carts[index] = cartFound;
            await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);

            return cartFound;
        } catch (error) {
            throw new ErrorManager(`Error al actualizar la cantidad: ${error.message}`, error.code || 500);
        }
    }
}
