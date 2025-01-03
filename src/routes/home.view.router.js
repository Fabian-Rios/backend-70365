import { Router } from "express";
import ComponentsManager from "../managers/ComponentsManager.js";

const router = Router();
const componentsManager = new ComponentsManager();

router.get("/", async (req, res, next) => {
    try {
        res.render("home", { title: "Inicio" });
    } catch (error) {
        next(error);
    }
});

router.get("/realTimeComponents", async (req, res, next) => {
    try {
        res.render("realTimeComponents", { title: "Inicio" });
    } catch (error) {
        next(error);
    }
});

router.get("/components", async (req, res, next) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const result = await componentsManager.getAllPaginated({ limit, page, sort, query });

        const {
            docs: components,
            totalPages,
            prevPage,
            nextPage,
            page: currentPage,
            hasPrevPage,
            hasNextPage,
        } = result;

        res.render("components", {
            title: "Componentes",
            components,
            totalPages,
            prevPage,
            nextPage,
            currentPage,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/components?page=${prevPage}&limit=${limit}` : null,
            nextLink: hasNextPage ? `/components?page=${nextPage}&limit=${limit}` : null,
        });
    } catch (error) {
        next(error);
    }
});

export default router;