import { Server } from "socket.io";
import ProductsManager from "../managers/ProductsManager.js";

const productsManager = new ProductsManager();

export const config = (httpServer) => {
    const socketServer = new Server(httpServer);

    socketServer.on("connection", async (socket) => {
        console.log("Conexión establecida", socket.id);

        const products = await productsManager.getAll();
        socket.emit("products-list", { products }); 

        socket.on("insert-product", async (data) => {
            try {
                await productsManager.insertOne(data);
                const updatedProducts = await productsManager.getAll();
                socketServer.emit("products-list", { products: updatedProducts });
            } catch (error) {
                socketServer.emit("error-message", { message: error.message });
            }
        });

        socket.on("delete-product", async (data) => {
            try {
                await productsManager.deleteOneById(Number(data.id));
                const updatedProducts = await productsManager.getAll();
                socketServer.emit("products-list", { products: updatedProducts });
            } catch (error) {
                socketServer.emit("error-message", { message: error.message });
            }
        });

        socket.on("disconnect", () => {
            console.log(`Cliente desconectado: ${socket.id}`);
        });
    });
};
