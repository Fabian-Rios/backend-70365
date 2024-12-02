import { Router } from "express";
import ComponentsManager from "../managers/ComponentsManager.js";
import uploader from "../utils/uploader.js";

const router = Router();
const componentsManager = new ComponentsManager();

// Ruta para obtener los componentes
router.get("/", async (req, res) => {
    try {
        const components = await componentManager.getAll(req.query);
        res.status(200).json({ status: "success", payload: components });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

// Ruta para obtener un componente por su ID
router.get("/:id", async (req, res) => {
    try {
        const component = await componentManager.getOneById(req.params.id);
        res.status(200).json({ status: "success", payload: component });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

// Ruta para crear un componente, permite la subida de imágenes
router.post("/", uploader.single("file"), async (req, res) => {
    try {
        const component = await componentManager.insertOne(req.body, req.file);
        res.status(201).json({ status: "success", payload: component });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

// Ruta para actualizar un componente por su ID, permite la subida de imágenes
router.put("/:id", uploader.single("file"), async (req, res) => {
    try {
        const component = await componentManager.updateOneById(req.params.id, req.body, req.file);
        res.status(200).json({ status: "success", payload: component });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

// Ruta para eliminar un componente por su ID
router.delete("/:id", async (req, res) => {
    try {
        await componentManager.deleteOneById(req.params.id);
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

export default router;