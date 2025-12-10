import { Router } from "express"
import prisma from "../lib/prisma"

const router = Router()

// -- obtenes todos los formularios
router.get("/", async (_req, res) => {
  try {
    const formularios = await prisma.formulario.findMany({
      orderBy: { idformulario: "desc" },
    });
    res.json({ ok: true, formularios });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
})

// -- crea un formulario nuevo
router.post("/newForm", async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      mail,
      fecha_nacimiento,
      direccion,
      ciudad,
      provincia,
      codigo_postal,
      pais,
      tipo_documento,
      numero_documento,
      tipo_vivienda,
      espacio_seguro,
      tiempo_solo,
      personas_encasa,
      familia_deacuerdo,
      otras_mascotas_anteriormente,
      tipo,
      otras_mascotas_actualmente,
      tipo_mascotas_actual,
      eventos,
      recursos,
      vacunar_y_esterilizar,
      encargado_cuidado,
      sitio_animal_solo,
      rol_del_animal,
      estado,
    } = req.body

    const formulario = await prisma.formulario.create({
      data: {
        nombre: nombre ,
        apellido: apellido ,
        telefono: parseInt(telefono),
        mail: mail ,
        fecha_nacimiento: fecha_nacimiento,
        direccion: direccion,
        ciudad: ciudad,
        provincia: provincia,
        codigo_postal: parseInt(codigo_postal),
        pais: pais,
        tipo_documento: tipo_documento,
        numero_documento: parseInt(numero_documento),
        tipo_vivienda,
        espacio_seguro,
        tiempo_solo: parseInt(tiempo_solo),
        personas_encasa: parseInt(personas_encasa),
        familia_deacuerdo,
        otras_mascotas_anteriormente,
        tipo,
        otras_mascotas_actualmente: parseInt(otras_mascotas_actualmente),
        tipo_mascotas_actual,
        eventos,
        recursos,
        vacunar_y_esterilizar,
        encargado_cuidado,
        sitio_animal_solo,
        rol_del_animal,
        estado,
      }
    })

    res.status(201).json({ ok: true, formulario });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message || "Error al crear formulario" });
  }
})

router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ ok: false, error: "ID inválido" });
        }

        const deleted = await prisma.formulario.delete({
            where: { idformulario: id }
        });

        res.status(200).json({ ok: true, deleted });
    } catch (e: any) {
        if (e.code === "P2025") {
            return res.status(404).json({ ok: false, error: "Formulario no encontrado" });
        }
        res.status(500).json({ ok: false, error: e.message || "Error al eliminar" });
    }
})

export default router
