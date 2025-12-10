import { Router } from "express"
import prisma from "../lib/prisma";

const router = Router();

// -- obtener todos los animales
router.get("/", async (_req, res) => {
	try {
		const animales = await prisma.animal.findMany({
		include: {
			usuario: {
			select: { idusuario: true, email: true },
			},
		},
		orderBy: { idanimal: "asc" },
		})
		const formatted = animales.map((p) => ({
		id: p.idanimal,
		nombre: p.nombre,
		tipo: p.tipo,
		raza: p.raza,
		edad:p.edad,
		especie: p.raza,
		adoptable: p.adoptable,
		foto: p.imagen_m,
		desc:p.descripcion
		}));
		res.json({ ok: true, formatted });
	} catch (e: any) {
		res.status(500).json({ ok: false, error: e.message });
	}
})

// -- añade animales a la bd
router.post("/addPet", async (req, res) => {
	try {
		const { nombre, tipo, raza, edad, descripcion, imagen_m } = req.body;

		const dueño = Number(req.session.userId)

		const animal = await prisma.animal.create({
		data: {
			nombre:nombre,
			tipo:tipo,
			raza:raza,
			edad: edad,
			descripcion: descripcion ,
			imagen_m: imagen_m,
			dueño: dueño
		},
		})
		
		res.status(201).json({ ok: true, data : animal });
	} catch (e: any) {
		res.status(400).json({ ok: false, error: e.message });
	}
})

router.put("/updatePet/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({
      ok: false,
      error: "ID inválido",
    });
    return;
  }

  const {
    nombre,
    tipo,
    raza,
    edad,
    descripcion,
    imagen_m,
    adoptable,
  } = req.body;

  try {
    const animal = await prisma.animal.update({
      where: { idanimal: id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(tipo !== undefined && { tipo }),
        ...(raza !== undefined && { raza }),
        ...(edad !== undefined && { edad: Number(edad) }),
        ...(descripcion !== undefined && { descripcion }),
        ...(imagen_m !== undefined && { imagen_m }),
        ...(adoptable !== undefined && { adoptable }),
      },
    });

    res.json({
      ok: true,
      animal,
    });
  } catch (error) {
    // Prisma error: record not found
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === "P2025"
    ) {
      res.status(404).json({
        ok: false,
        error: "Animal no encontrado",
      });
      return;
    }

    res.status(400).json({
      ok: false,
      error: "Error al actualizar animal",
    });
  }
});

// -- elimina mascotas
router.delete("/deletePet/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.animal.delete({
		where: { idanimal: id },
    })

	
    res.json({ ok: true, message: "Animal eliminado" });
} catch (e: any) {
	if (e.code === "P2025") {
      return res.status(404).json({ ok: false, error: "Animal no encontrado" });
    }
    res.status(400).json({ ok: false, error: e.message || "Error al eliminar animal" });
  }
})

router.patch("/:id/adopt", async (req,res)=>{
	try {
        const id = Number(req.params.id)
        const dueño =  Number(req.session.id) // ID del usuario que adopta
		console.log(dueño)
        // Verificar que exista el usuario
        const userExists = await prisma.users.findUnique({
            where: { idusuario: dueño }
        });

        if (!userExists) {
            return res.status(404).json({ ok: false, error: "El usuario no existe" });
        }

        // Actualizar mascota
        const updated = await prisma.animal.update({
            where: { idanimal: id },
            data: {
                adoptable: false,
                dueño: dueño
            },
            include: {
                usuario: true
            }
        });

        res.json({ ok: true, animal: updated });

    } catch (e: any) {
        res.status(500).json({ ok: false, error: e.message });
    }
})
export default router;

