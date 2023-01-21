import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3333" // Para usar no mobile tem que trocar tudo entre o "http://" e ":3333" pelo ip da sua máquina
})