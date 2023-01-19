import Fastify from "fastify";
import { PrismaClient } from "@prisma/client" // Importando o prisma client
import cors from "@fastify/cors"

const app = Fastify() // Criando aplicação
const prisma = new PrismaClient()

app.register(cors)

app.get("/hello", async () => {
    const habits = await prisma.habit.findMany()

    return habits
})

app.listen(
    {
        port: 3333 // Objeto port
    }
).then(() => 
    {
        console.log("HTTP server runningcd code ")
    }
)