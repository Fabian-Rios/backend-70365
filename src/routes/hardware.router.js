import { Router } from "express";
import HardwareManager from "../managers/HardwareManager.js";

const router = Router();
const hardwareManager = new HardwareManager();


router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = "asc", query = "" } = req.query;

        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);

        const hardwares = await hardwareManager.getAll({
            limit: limitNum,
            page: pageNum,
            sort,
            query
        });

        const totalHardwares = await hardwareManager.getTotalHardwares(query);
        const totalPages = Math.ceil(totalHardwares / limitNum);
        const prevPage = pageNum > 1 ? pageNum - 1 : null;
        const nextPage = pageNum < totalPages ? pageNum + 1 : null;
        const hasPrevPage = prevPage !== null;
        const hasNextPage = nextPage !== null;

        const response = {
            status: "success",
            payload: hardwares,
            totalPages,
            prevPage,
            nextPage,
            page: pageNum,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/api/hardwares?page=${prevPage}&limit=${limitNum}&sort=${sort}&query=${query}` : null,
            nextLink: hasNextPage ? `/api/hardwares?page=${nextPage}&limit=${limitNum}&sort=${sort}&query=${query}` : null
        };

        res.json(response);
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const hardware = await hardwareManager.getOneById(req.params.id);
        res.status(200).json({ status: "success", payload: hardware });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});


router.post("/", async (req, res) => {
    try {
        if (!req.body.components || !Array.isArray(req.body.components)) {
            return res.status(400).json({ status: "error", message: "Se requieren componentes válidos." });
        }

        const hardware = await hardwareManager.insertOne(req.body);
        res.status(201).json({ status: "success", payload: hardware });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});


router.post("/:cid/components/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({ status: "error", message: "La cantidad debe ser mayor a 0." });
        }

        const hardware = await hardwareManager.addOneIngredient(cid, pid, quantity || 1);
        res.status(200).json({ status: "success", payload: hardware });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});


router.put("/:cid/components/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ status: "error", message: "Cantidad inválida." });
        }

        const updatedCart = await hardwareManager.updateProductQuantity(cid, pid, quantity);
        res.status(200).json({ status: "success", payload: updatedCart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});


router.delete("/:cid/components/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const hardware = await hardwareManager.deleteComponentFromCart(cid, pid);
        res.status(200).json({ status: "success", payload: hardware });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});


router.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const clearedCart = await hardwareManager.clearCart(cid);
        res.status(200).json({ status: "success", payload: clearedCart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

export default router;
