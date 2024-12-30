import { Server } from "socket.io";
import ComponentManager from "../managers/ComponentsManager.js";

const componentManager = new ComponentManager();

export const config = (httpServer) => {
    const socketServer = new Server(httpServer);

    socketServer.on("connection", async (socket) => {
        console.log("Conexión establecida", socket.id);

        const components = await componentManager.getAll();
        socket.emit("components-list", { components }); 

        socket.on("insert-component", async (data) => {
            try {
                await componentManager.insertOne(data);
                const updatedComponents = await componentManager.getAll();
                socketServer.emit("components-list", { components: updatedComponents });
            } catch (error) {
                socketServer.emit("error-message", { message: error.message });
            }
        });

        socket.on("delete-component", async (data) => {
            try {
                await componentManager.deleteOneById(Number(data.id));
                const updatedComponents = await componentManager.getAll();
                socketServer.emit("components-list", { components: updatedComponents });
            } catch (error) {
                socketServer.emit("error-message", { message: error.message });
            }
        });

        socket.on("disconnect", () => {
            log("info", `Cliente desconectado: ${socket.id}`);
        });
    });
};
