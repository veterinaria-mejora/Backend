import { Router } from "express"
import prisma from "../lib/prisma"

const router = Router()

// -- obtiene todos los productos existentes
router.get("/", async (_req, res) => {
  try {
    const products = await prisma.productos.findMany({
      select: {
        idproducto: true,
        nombre: true,
        precio: true,
        stock: true,
        url_imagen: true
      }
    });
    
    const formattedProducts = products.map(p => ({
      id: p.idproducto,
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      url_imagen: p.url_imagen
    }));
    
    res.json({ ok: true, data: formattedProducts });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || "Error al obtener productos" });
  }
})

//añade productos a la base de datos
router.post("/addProduct", async (req,res)=>{
    const { nombre, precio, stock, url_imagen } = req.body
    try {
        console.log(nombre,precio,stock,url_imagen)
    const add = await prisma.productos.create({
        data:{
            nombre:nombre,
            precio:parseFloat(precio),
            stock:parseInt(stock),
            url_imagen:url_imagen
        },
        select:{
            idproducto:true,
            nombre:true
        }
    })
    console.log(add);
    
    if (!add) throw new Error("error añadiendo producto")

    res.status(201).json( {ok:false, message:"se ha añadido el producto con exito", data: add})

    } catch (e:any) {
        res.status(500).json( {ok:false, error:e.message})
    }
    

})

// -- actualiza el stock de un producto especifico
router.put("/updateStock/:id", async (req,res)=>{
    const id = Number(req.params.id)
    const newStock = req.body.stock

    try {
        const exist = await prisma.productos.update({
        where: {idproducto:id},
        data:{stock:newStock},
        select:{
            idproducto:true,
            stock:true
        }
    })
    res.status(200).json({ ok:true, data:exist })
    } catch (e:any) {
        if (e.code === "P2025") {
        return res.status(404).json({ ok: false, error: "Producto no encontrado" });
    }
    return res.status(500).json({ ok: false, error: "Error actualizando" });
    }
})

// -- Elimina un producto de la abse de datos.
router.delete("/deleteProduct/:id", async (req,res)=>{
    const id = Number(req.params.id)
    try {
        const deleted = await prisma.productos.delete({
            where:{idproducto:id},
            select:{
                idproducto:true
            }
        })
        
        return res.status(200).json({ok:true, data:deleted})
    } catch (e:any) {
        if (e.code === "P2025") {
        return res.status(404).json({ ok: false, error: "Producto no encontrado" });
    }
    return res.status(500).json({ ok: false, error: "Error actualizando" });
    }
})

export default router;

