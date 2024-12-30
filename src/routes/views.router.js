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
        res.render("realTimeComponents", { title: "Componentes en Tiempo Real" });
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

router.get("/components/:id", async (req, res, next) => {
    try {
        const component = await componentsManager.getOneById(req.params.id);

        if (!component) {
            return res.status(404).render("error404", { title: "Error 404", message: "Componente no encontrado" });
        }

        res.render("componentDetail", {
            title: `Detalle del Componente ${component.title}`,
            component,
        });
    } catch (error) {
        next(error);
    }
});

router.get("/carts/:cid", async (req, res, next) => {
    try {
        const cart = await componentsManager.getCartById(req.params.cid);

        if (!cart) {
            return res.status(404).render("error404", { title: "Error 404", message: "Carrito no encontrado" });
        }

        res.render("cartDetail", {
            title: `Detalle del Carrito ${req.params.cid}`,
            cart,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
