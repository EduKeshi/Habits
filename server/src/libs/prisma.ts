import { PrismaClient } from "@prisma/client" // Importando o prisma client

export const prisma = new PrismaClient({
    log: ["query"]
})
