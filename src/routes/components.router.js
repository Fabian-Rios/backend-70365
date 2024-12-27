import { Router } from "express";
import ComponentsManager from "../managers/ComponentsManager.js";
import uploader from "../utils/uploader.js";

const router = Router();
const componentsManager = new ComponentsManager(); // Corrige el nombre de la instancia

router.get("/", async (req, res) => {
    try {
        const components = await componentsManager.getAll(req.query); // Corrección aquí también
        res.status(200).json({ status: "success", payload: components });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const component = await componentsManager.getOneById(req.params.id); // Corrección aquí
        res.status(200).json({ status: "success", payload: component });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.post("/", uploader.single("file"), async (req, res) => {
    try {
        const component = await componentsManager.insertOne(req.body, req.file); // Corrección aquí
        res.status(201).json({ status: "success", payload: component });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.put("/:id", uploader.single("file"), async (req, res) => {
    try {
        const component = await componentsManager.updateOneById(req.params.id, req.body, req.file); // Corrección aquí
        res.status(200).json({ status: "success", payload: component });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await componentsManager.deleteOneById(req.params.id); // Corrección aquí
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

export default router;
