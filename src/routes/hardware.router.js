import { Router } from "express";
import HardwareManager from "../managers/HardwareManager.js";

const router = Router();
const hardwareManager = new HardwareManager();


router.get("/", async (req, res) => {
    try {
        const hardwares = await hardwareManager.getAll(req.query);
        res.status(200).json({ status: "success", payload: hardwares });
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
        const hardware = await hardwareManager.addOneComponent(cid, pid, quantity || 1);
        res.status(200).json({ status: "success", payload: hardware });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

export default router;