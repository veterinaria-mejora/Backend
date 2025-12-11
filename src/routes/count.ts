import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        // Ejecutamos ambos conteos en paralelo
        const [totalUsuarios, totalMascotas] = await Promise.all([
            prisma.users.count(),
            prisma.animal.count()
        ]);

        const [totalFormularios, totalAceptados, totalRechazados] = await Promise.all([
            prisma.formulario.count(),
            prisma.formulario.count({ where: { estado: "aceptado" } }),
            prisma.formulario.count({ where: { estado: "rechazado" } })
        ]);


        res.json({
            ok: true,
            totalUsuarios,
            totalMascotas,
            totalFormularios,
            totalAceptados,
            totalRechazados
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: "Error al obtener los conteos" });
    }
});

export default router;
