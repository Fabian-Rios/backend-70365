import { Router } from "express";
import ComponentsManager from "../managers/ComponentsManager.js";
import uploader from "../utils/uploader.js";

const router = Router();
const componentsManager = new ComponentsManager();

router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = "", query = "" } = req.query;

        const { products, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage, prevLink, nextLink } = 
            await componentsManager.getAll({
                limit: parseInt(limit),
                page: parseInt(page),
                sort,
                query,
            });

        res.status(200).json({
            status: "success",
            payload: products,
            totalPages,
            prevPage,
            nextPage,
            page: parseInt(page),
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const component = await componentsManager.getOneById(req.params.id);
        res.status(200).json({ status: "success", payload: component });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.post("/", uploader.single("file"), async (req, res) => {
    try {
        if (!req.body.title || !req.body.stock) {
            return res.status(400).json({ status: "error", message: "Faltan datos obligatorios." });
        }

        const component = await componentsManager.insertOne(req.body, req.file);
        res.status(201).json({ status: "success", payload: component });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.put("/:id", uploader.single("file"), async (req, res) => {
    try {
        if (!req.body.title && !req.body.stock) {
            return res.status(400).json({ status: "error", message: "No se proporcionaron datos para actualizar." });
        }

        const component = await componentsManager.updateOneById(req.params.id, req.body, req.file);
        res.status(200).json({ status: "success", payload: component });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await componentsManager.deleteOneById(req.params.id);
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

export default router;
