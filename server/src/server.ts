import Fastify from "fastify";
import cors from "@fastify/cors"
import { appRoutes } from "./routes";

const app = Fastify() // Criando aplicação

app.register(cors)
app.register(appRoutes)

app.listen(
    {
        port: 3333, // Objeto port
        host: "0.0.0.0"
    }
).then(() => 
    {
        console.log("HTTP server running!")
    }
)