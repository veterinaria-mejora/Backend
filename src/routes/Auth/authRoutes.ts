import { registerUser,  loginUser,  createResetToken,  resetPassword,  validateResetToken } from "./authFunctions"
import { sendPasswordResetEmail } from "../../services/mailer"
import { Router } from "express"
import prisma from "../../lib/prisma"
import jwt from "jsonwebtoken" 
import { ok } from "assert"
const router = Router()
const APP_BASE_URL = process.env.APP_BASE_URL



// -- te autentica en base a la cookie
router.get("/authMe", async (req, res) => {
    const token = req.cookies?.auth_token;

    if (!token) {
        return res.status(401).json({ ok: false, error: "no autenticado" });
    }

    try {
        // 1. Validar token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        // 2. Buscar usuario
        const user = await prisma.users.findUnique({
        where: { idusuario: decoded.id }
        });

        if (!user) {
        return res.status(401).json({ ok: false, error: "sesión inválida" });
        }

        // 3. Devolver datos mínimos
        return res.json({
        ok: true,
        user: {
            id: user.idusuario,
            name: user.name,
            lastname: user.lastname,
            email: user.email
        }
        });

    } catch (err) {
        return res.status(401).json({ ok: false, error: "token inválido" });
    }
});

// -- te registra 
router.post("/register", async (req, res) => {
    const { name, lastname, email, password } = req.body

    try {
    const user = await registerUser({ name, lastname, email, password });
    (req.session).idusuario = user.id;
    (req.session).userEmail = email;
    
    const payload = { id: user.id, email: user.email };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });

    res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });


    res.status(201).json({ ok: true, data: { id: user.id, email } });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message || "error en registro" });
  }
});

// -- te loguea 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await loginUser(email, password);
    (req.session as any).userId = user.id;
    (req.session as any).userEmail = user.email;
    
    const token = jwt.sign({ id: user.id, email: user.email },process.env.JWT_SECRET!,{ expiresIn: "7d" });

    res.cookie("auth_token", token, {httpOnly: true, sameSite: "strict", secure: false, maxAge: 1000 * 60 * 60 * 48,});
    
    res.status(200).json({ ok: true, data: user });
  } catch (e: any) {
    res.status(401).json({ ok: false, error: e.message});
  }
});

// -- elimina los tokens para la persistencia de sesion 
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ ok: false, error: "no se pudo cerrar sesion" });
    res.clearCookie("connect.sid")
    res.clearCookie("auth_token")
    res.json({ ok: true });
  });
});

// -- se encarga de mandarte el mail 
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body

        const token = await createResetToken(email)

         if (!APP_BASE_URL) throw new Error("APP_BASE_URL no definida")

        const base = APP_BASE_URL.replace(/\/$/, "");
        const resetUrl = `${base}/frontend/vistas/login/reset.html?token=${token}`;
        const sent = await sendPasswordResetEmail(email, token, resetUrl);
        console.log("forgot sent:", sent," ",token)

        return res.json({ ok: true, message: "Han sido enviado un gmail de recuperacion, revise spam y bandeja" });
    } catch (e: any) {
        return res.status(500).json({ ok: false, error: e.message || "error al solicitar reseteo" });
    }
});

// -- se encarga de validar el token
router.post("/validToken", async (req, res) => {
    try {
        const token = req.body.token
        console.log(token)
        await validateResetToken(token)

        res.status(200).json({ ok: true, message: "tu token es valido" })

    } catch (e:any) {
        res.status(400).json({ ok: false, error: e.message })
    }
});

// -- te cambia la contraseña
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    await resetPassword(token, password);

    return res.json({ ok: true, message: "contrasena actualizada" });

  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e.message});
  }
});


export default router