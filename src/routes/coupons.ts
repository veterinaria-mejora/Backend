import { Router } from "express"
import  prisma  from "../lib/prisma"

const router = Router();

// -- devuelve todos los cupones activos
router.get("/all", async (_req, res) => {
  try {
    
    const cupones = await prisma.coupon.findMany({
      select: { code: true, discount:true, active:true },
    })

    res.json({
      ok: true,
      data: cupones,
    });

  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e.message || "Error al obtener cupones",
    });
  }
});


// -- permite usar un cupon
router.patch("/use",async (req,res)=>{
    try {
        const {coupon} = req.body
        const validate = await prisma.coupon.findFirst({
            where: {
                code: coupon,
                active: true
            }
        })
        if (!validate) {
            return res.status(400).json({ ok: false, error: "Cupón inválido o ya ulizado" });
        } 

        const newstate = await prisma.coupon.update({
            where: { code: validate.code },
            data: { active: false },
            select: { discount:true}
        })

        return res.status(201).json({ ok: true, data: newstate })
    } catch (error) {
        return res.status(500).json({ok:false, error:"cupon invalido"})
    }
})

// -- añade un cupon inexistente
router.post("/add", async (req, res) => {
  try {
    const { code, discount } = req.body;
    console.log(code,discount)
    if (!code || typeof code !== "string") {
      return res.status(400).json({ ok: false, error: "Código de cupón requerido" });
    }
    console.log(code,discount)
    
    try {
      const coupon = await prisma.coupon.create({
        data: {
          code: code.trim().toLowerCase(),
          discount:parseInt(discount)
        },
        select:{code:true}
      });
      console.log(code,discount)
      
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

router.patch("/desAbility", async (req, res) => {
    try {
        const {code, state} = req.body

        const result = await prisma.coupon.updateMany({
            where: {
                code: code,
                active: state,
            },
            data: {
                active: !state,
            },
        });

        return res.json({ ok: true, message: "Cupón eliminado correctamente", data:result });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e.message || "Error al eliminar cupón" });
    }
})

router.delete("/delete/:code", async (req, res) => {
    try {
        const { code } = req.params

        const result = await prisma.coupon.delete({
            where: { code }
        });

        return res.json({
            ok: true,
            message: "Cupón eliminado correctamente",
            data: result
        });

    } catch (e: any) {
        return res.status(500).json({
            ok: false,
            error: e.message || "Error al eliminar cupón"
        });
    }
});

export default router;
