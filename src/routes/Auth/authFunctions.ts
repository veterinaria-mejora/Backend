import bcrypt from "bcrypt"
import crypto from "crypto"
import  prisma  from "../../lib/prisma"
import jwt from "jsonwebtoken"

export function authMiddleware(req:any, res:any, next:any) {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ error: "Falta token" });
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = data;            // acá tenés { id, email, iat, exp }
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

// funcion quwe se encarga de registrar meidnate la integracion delos datos a la base de datos - 
export async function registerUser(input: {name?: string;  lastname?: string;  email: string;  password: string}) {
  
    const { name, lastname, email, password } = input;

    // Verificar si el usuario ya existe
    const exists = await prisma.users.findUnique({ where: { email } });

    if (exists) {
        throw new Error("El email ya esta registrado");
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
        data: {
        name: name,
        lastname: lastname,
        email,
        password_hash: hash,
        },
        select: {
        idusuario: true,
        email: true
        },
    })

    return { id: user.idusuario, email: user.email }
}

// funcion encargada del login
export async function loginUser(email: string, password: string) {
    const user = await prisma.users.findUnique({where: { email },})
    
    if (!user) {
        throw new Error("Credenciales invalidas");
        }
    
    const isValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isValid) {
        throw new Error("Credenciales invalidas");
    }

    return { id: user.idusuario, email: user.email, role: user.role }

}

// funcion que crea un token para el reinicio de contraseña
export async function createResetToken(email: string) {
	const user = await prisma.users.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("gmail no existente")
	}

	const token = crypto.randomBytes(32).toString("hex");

	const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

	await prisma.password_resets.create({
		data: {
		user_id: user.idusuario,
		reset_token: token,
		expiration_date: expirationDate,
		},
	});


	return token
}

//meramente valida el token para ver si existe en la base de datos
export async function validateResetToken(token: string) {
	const row = await prisma.password_resets.findFirst({
		where: { reset_token: token }
	});
	
	if (!row) throw new Error("token incorrecto");

	if (row.expiration_date && row.expiration_date.getTime() < Date.now()) {
		throw new Error("el token ha expirado");
	}
}

//literalmente resetea la contraseña
export async function resetPassword(token: string, newPassword: string) {
	const row = await prisma.password_resets.findFirst({
		where: { reset_token: token },
	});

	if (!row) {
		throw new Error("Token invalido o expirado");
	}

	const hash = await bcrypt.hash(newPassword, 10);

	// actualizar contraseña del usuario
	await prisma.users.update({
		where: { idusuario: row.user_id },
		data: { password_hash: hash },
	});


	// eliminar el token usado
	await prisma.password_resets.delete({ where: { id: row.id } })
}

