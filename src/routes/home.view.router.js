import { Router } from "express";
import ProductsManager from "../managers/ProductsManager.js";

const router = Router();
const productsManager = new ProductsManager();

router.get("/", async (req, res, next) => {
    try {
        res.render("home", { title: "Inicio" });
    } catch (error) {
        next(error);
    }
});

router.get("/realTimeProducts", async (req, res, next) => {
    try {
        res.render("realTimeProducts", { title: "Inicio" });
    } catch (error) {
        next(error);
    }
});

router.get("/products", async (req, res, next) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const result = await productsManager.getAllPaginated({ limit, page, sort, query });

        const {
            docs: products,
            totalPages,
            prevPage,
            nextPage,
            page: currentPage,
            hasPrevPage,
            hasNextPage,
        } = result;

        res.render("products", {
            title: "Productos",
            products,
            totalPages,
            prevPage,
            nextPage,
            currentPage,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/products?page=${prevPage}&limit=${limit}` : null,
            nextLink: hasNextPage ? `/products?page=${nextPage}&limit=${limit}` : null,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
