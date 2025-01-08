import { Router } from "express";
import CartsManager from "../managers/CartsManager.js";

const router = Router();
const cartsManager = new CartsManager();

router.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = "asc", query = "" } = req.query;

        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);

        const carts = await cartsManager.getAll({
            limit: limitNum,
            page: pageNum,
            sort,
            query
        });

        const totalCarts = await cartsManager.getTotalCarts(query);
        const totalPages = Math.ceil(totalCarts / limitNum);
        const prevPage = pageNum > 1 ? pageNum - 1 : null;
        const nextPage = pageNum < totalPages ? pageNum + 1 : null;
        const hasPrevPage = prevPage !== null;
        const hasNextPage = nextPage !== null;

        const response = {
            status: "success",
            payload: carts,
            totalPages,
            prevPage,
            nextPage,
            page: pageNum,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/api/carts?page=${prevPage}&limit=${limitNum}&sort=${sort}&query=${query}` : null,
            nextLink: hasNextPage ? `/api/carts?page=${nextPage}&limit=${limitNum}&sort=${sort}&query=${query}` : null
        };

        res.json(response);
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const cart = await cartsManager.getOneById(req.params.id);
        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        if (!req.body.products || !Array.isArray(req.body.products)) {
            return res.status(400).json({ status: "error", message: "Se requieren productos válidos." });
        }

        const cart = await cartsManager.insertOne(req.body);
        res.status(201).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.post("/:cartId/products/:productId", async (req, res) => {
    try {
        const cartId = Number(req.params.cartId); 
        const productId = Number(req.params.productId); 
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ status: "error", message: "Cantidad inválida." });
        }

        const updatedCart = await cartsManager.addProductToCart(cartId, productId, quantity);
        res.status(200).json({ status: "success", payload: updatedCart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});



router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ status: "error", message: "Cantidad inválida." });
        }

        const updatedCart = await cartsManager.updateProductQuantity(cid, pid, quantity);
        res.status(200).json({ status: "success", payload: updatedCart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const updatedCart = await cartsManager.removeProductFromCart(cid, pid);
        res.status(200).json({ status: "success", payload: updatedCart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});


router.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const clearedCart = await cartsManager.clearCart(cid);
        res.status(200).json({ status: "success", payload: clearedCart });
    } catch (error) {
        res.status(error.code || 500).json({ status: "error", message: error.message });
    }
});

export default router;
