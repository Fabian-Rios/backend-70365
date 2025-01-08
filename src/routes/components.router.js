import { Router } from "express";
import ComponentsManager from "../managers/ComponentsManager.js";
import uploader from "../utils/uploader.js";

const router = Router();
const componentsManager = new ComponentsManager();

router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = "asc", query = "" } = req.query;

        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);

        const components = await componentsManager.getAll({
            limit: limitNum,
            page: pageNum,
            sort,
            query
        });

        const totalComponents = await componentsManager.getTotalComponents(query);
        const totalPages = Math.ceil(totalComponents / limitNum);
        const prevPage = pageNum > 1 ? pageNum - 1 : null;
        const nextPage = pageNum < totalPages ? pageNum + 1 : null;
        const hasPrevPage = prevPage !== null;
        const hasNextPage = nextPage !== null;

        const response = {
            status: "success",
            payload: components,
            totalPages,
            prevPage,
            nextPage,
            page: pageNum,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/api/components?page=${prevPage}&limit=${limitNum}&sort=${sort}&query=${query}` : null,
            nextLink: hasNextPage ? `/api/components?page=${nextPage}&limit=${limitNum}&sort=${sort}&query=${query}` : null
        };

        res.json(response);
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
            return res.status(400).json({ status: "error", message: "no se proporcionaron datos para actualizar." });
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
