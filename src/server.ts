import express, { Express, Request, Response } from "express"
import connectPgSimple from "connect-pg-simple"
const session = require("express-session")
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import prisma from "./lib/prisma"
import cookieParser from "cookie-parser";



// Importar rutas
import routerauth from "./routes/Auth/authRoutes";
import productsRouter from "./routes/products";
import cartRouter from "./routes/cart";
import couponsRouter from "./routes/coupons";
import petsRouter from "./routes/animales";
import paymentsRouter from "./routes/payments";
import formulariosRouter from "./routes/formularios";

dotenv.config()

async function initAuthSchema() {
    try {
        await prisma.$connect();
        console.log("✅ Conectado a PostgreSQL con Prisma");
    }   catch (error) {
        console.error("❌ Error conectando a PostgreSQL:", error);
        throw error;
    }
}

const app = express()
const PORT = Number(process.env.PORT)
const SESSION_SECRET = process.env.SESSION_SECRET

const PgSession = connectPgSimple(session);

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true, sameSite: "lax", secure: false }
  })
)

app.use("/backend/user", routerauth)
app.use("/backend/pets", petsRouter)
app.use("/backend/products", productsRouter)
app.use("/backend/form", formulariosRouter);

app.use("/backend/coupons", couponsRouter);
app.use("/backend/cart", cartRouter);
app.use("/backend/payments", paymentsRouter);


// Inicializar servidor
initAuthSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
  });
});
