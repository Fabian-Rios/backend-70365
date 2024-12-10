import { Server } from "socket.io";
import ComponentManager from "../managers/ComponentsManager.js";

const componentManager = new ComponentManager();

// Configura el servidor Socket.IO
export const config = (httpServer) => {
    // Crea una nueva instancia del servidor Socket.IO
    const socketServer = new Server(httpServer);

    // Escucha el evento de conexión de un nuevo cliente
    socketServer.on("connection", async (socket) => {
        console.log("Conexión establecida", socket.id);

        // Envía la lista de ingredientes al conectarse
        socketServer.emit("components-list", { components: await componentManager.getAll() });

        socket.on("insert-component", async (data) => {
            try {
                await componentManager.insertOne(data);

                // Envía la lista de ingredientes actualizada después de insertar
                socketServer.emit("components-list", { components: await componentManager.getAll() });
            } catch (error) {
                // Envía el mensaje de error
                socketServer.emit("error-message", { message: error.message });
            }
        });

        socket.on("delete-component", async (data) => {
            try {
                await componentManager.deleteOneById(Number(data.id));

                // Envía la lista de ingredientes actualizada después de insertar
                socketServer.emit("components-list", { components: await componentManager.getAll() });
            } catch (error) {
                // Envía el mensaje de error
                socketServer.emit("error-message", { message: error.message });
            }
        });

        // Escucha el evento de desconexión del cliente
        socket.on("disconnect", () => {
            console.log("Se desconecto un cliente"); // Indica que un cliente se desconectó
        });
    });
};