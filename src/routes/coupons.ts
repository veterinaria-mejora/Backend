import { Router } from "express"
import  prisma  from "../lib/prisma"

const router = Router();

// -- devuelve todos los cupones activos
router.get("/all", async (_req, res) => {
  try {
    const cupones = await prisma.coupon.findMany({
      where: { active: true },
      select: { code: true },
    });
    console.log(cupones)
    const codes = cupones.map((c,i) => ({[i]:c.code}))
    console.log(codes)
    if (codes.length == 0) {
      return res.json({ ok: true, data: [] })
    }
    
    res.json({ ok: true, data: codes })
  } catch(e:any){

    res.json({ ok: false, error:e })
  }
})

// -- añade un cupon inexistente
router.post("/add", async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== "string") {
      return res.status(400).json({ ok: false, error: "Código de cupón requerido" });
    }

    try {
      const coupon = await prisma.coupon.create({
        data: {
          code: code.trim().toLowerCase(),
        },
        select:{code:true}
      });
      
      res.json({ ok: true, message: "Cupón creado correctamente", data:coupon });
    } catch (e: any) {
      if (e.code === "P2002") {
        return res.status(400).json({ ok: false, error: "El cupón ya existe" });
      }
      throw e;
    }
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || "Error al crear cupón" });
  }
})

// -- desactiva el cupon 
router.patch("/:code", async (req, res) => {
    try {
        const code = decodeURIComponent(req.params.code).trim().toLowerCase();

        const result = await prisma.coupon.updateMany({
            where: {
                code: code,
                active: true,
            },
            data: {
                active: false,
            },
        });

        if (result.count === 0) {
            return res.status(404).json({ ok: false, error: "Cupón no encontrado o ya inactivo" });
        }

        return res.json({ ok: true, message: "Cupón eliminado correctamente" });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e.message || "Error al eliminar cupón" });
    }
})

export default router;
