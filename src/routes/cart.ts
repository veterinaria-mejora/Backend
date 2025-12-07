
import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "./Auth/authFunctions";

const router = Router();


// obtener los productos guardados al carrito
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id
    const cartItems = await prisma.cart_item.findMany({
      where: { user_id: userId },
      include: {
        product: {
          select: {
            idproducto: true,
            url_imagen:true,
            nombre: true,
            precio: true,
            stock: true
          }
        }
      }
    });

    const items = cartItems.map(item => ({
      id: item.product.idproducto,
      nombre: item.product.nombre,
      imagen: item.product.url_imagen,
      precio: item.product.precio,
      cantidad: item.quantity,
      stock: item.product.stock
    }));
    console.log(items)
    res.json({ ok: true, data: { items } });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || "Error al obtener carrito" });
  }
});

// añadir productos al carrito
router.post("/add", authMiddleware,async (req: any, res) => {
    try {
        const userId = req.user.id
        console.log(userId)
        const { productId, quantity } = req.body;

        // Verificar que el producto existe y tiene stock
        const product = await prisma.productos.findUnique({
        where: { idproducto: productId }
        })

        if (!product) {
        return res.status(404).json({ ok: false, error: "Producto no encontrado" })
        }

        if (product.stock < quantity) {
        return res.status(400).json({ ok: false, error: "Stock insuficiente" })
        }

        // Agregar o actualizar item en el carrito
        await prisma.cart_item.upsert({
        where: {
            user_id_product_id: {
            user_id: userId,
            product_id: productId
            }
        },
        update: {
            quantity: {
            increment: quantity
            }
        },
        create: {
            user_id: userId,
            product_id: productId,
            quantity: quantity
        }
        });
        await prisma.productos.update({
        where: { idproducto: productId },
        data: {
            stock: {
                decrement: quantity
            }
        }
    })
        res.json({ ok: true, message: "Producto agregado al carrito" });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e.message || "Error al agregar al carrito" });
    }
});

// elimina un elemento seleccionado / saca su stock
router.delete("/delete/:id",authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id
    const productId = parseInt(req.params.id)
    const cantRestar = 1
    const stockItemCar = await prisma.cart_item.findUnique({
    where: {
        user_id_product_id: {
            user_id: userId,
            product_id: productId
            }
        }
    })
    console.log(stockItemCar)
    
    if (!stockItemCar) return res.status(404).json({ ok: false, error: "Producto no encontrado" })
    
    if(stockItemCar.quantity == 1){
    await prisma.cart_item.delete({
    where: {
        user_id_product_id: {
        user_id: userId,
        product_id: productId
        }
    }
    })
    await prisma.productos.update({
        where: { idproducto: productId },
        data: {
            stock: {
                increment: cantRestar
            }
        }
    })
    return res.status(201).json({ ok: true, message: "Producto eliminado del carrito" });
    } else{

    
    await prisma.cart_item.update({
        where: {
        user_id_product_id: {
            user_id: userId,
            product_id: productId
            }
        },
        data: {
            quantity: {
                decrement: cantRestar
            }
        }
    })
    await prisma.productos.update({
        where: { idproducto: productId },
        data: {
            stock: {
                increment: cantRestar
            }
        }
    })
    return res.json({ ok: true, message: "el stock de su producto ha sido modificado en 1" })
    }
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || "Error al eliminar del carrito" });
  }
});

// DELETE /api/cart - Vaciar carrito
router.delete("/",authMiddleware,  async (req: any, res) => {
  try {
    const userId = req.session.userId;

    await prisma.cart_item.deleteMany({
      where: {
        user_id: userId
      }
    });

    res.json({ ok: true, message: "Carrito vaciado" });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || "Error al vaciar carrito" });
  }
});

export default router;

