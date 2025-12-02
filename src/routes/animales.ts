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

// -- actualiza cualquier dato ingresado
router.put("/updatePet/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

	const { nombre, tipo, raza, edad, descripcion, imagen_m, adoptable } = req.body;

	const valid = await prisma.animal.findUnique({
		where:{ idanimal:id },
		select:{
			dueño:true
		}
	})

    if (isNaN(id) || valid) {
      return res.status(400).json({ ok: false, error: "ID inválido" });
    }

    const animal = await prisma.animal.update({
      where: { idanimal: id },
      data: {
			nombre:nombre,
			tipo:tipo,
			raza:raza,
			edad: edad,
			descripcion: descripcion ,
			imagen_m: imagen_m,
			adoptable:adoptable ,
			dueño: valid,
		},
    });
    res.json({ ok: true, animal });
  } catch (e: any) {
    if (e.code === "P2025") {
      return res.status(404).json({ ok: false, error: "Animal no encontrado" });
    }
    res.status(400).json({ ok: false, error: e.message || "Error al actualizar animal" });
  }
})

// -- elimina mascotas
router.delete("/deletePet/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, error: "ID inválido" });
    }

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

