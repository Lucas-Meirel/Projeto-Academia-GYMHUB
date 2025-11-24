import { routerChat } from './routes/routerchat';
import authRoutes from "./routes/authRoutes";
import routerAula from "./routes/aulaRoutes";
import express from 'express';
import cors from 'cors';

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', routerChat)
app.use("/api/auth", authRoutes);
app.use("/api/aulas", routerAula);