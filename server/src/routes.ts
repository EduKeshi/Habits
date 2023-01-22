import { FastifyInstance } from "fastify"
import { prisma } from "./libs/prisma"
import { z } from "zod"
import dayjs from "dayjs"

export async function appRoutes(app: FastifyInstance) {
    app.post("/habits", async (request) => {

        // Declarando como o corpo da requisição tem que ser
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(z.number().min(0).max(6))
        })

        const { title, weekDays } = createHabitBody.parse(request.body)

        // Zerando a hora, minutos e segundos para evitar problemas na hora de listar os hábitos
        const today = dayjs().startOf("day").toDate()

        // Salvando no banco de dados
        await prisma.habit.create({
            data: {
                title: title,
                created_at: today,
                WeekDays: {
                    create: weekDays.map(weekDays => {
                        return {
                            week_day: weekDays,
                        }
                    })
                }
            }
        })
    })

    app.get("/day", async (request) => {
        const getDayParams = z.object({
            date: z.coerce.date() // Convertendo a string em um objeto date
        })

        const { date } = getDayParams.parse(request.query)
        const parsedDate = dayjs(date).startOf("day")
        const weekDay = parsedDate.get("day")

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date,
                },
                WeekDays: {
                    some: {
                        week_day: weekDay,
                    }
                }
            }
        })

        const day = await prisma.day.findUnique({
            where: {
                date: parsedDate.toDate(),
            },
            include: {
                DayHabits: true
            }
        })

        const completedHabits = day?.DayHabits.map(dayHabit => {
            return dayHabit.habit_id
        }) ?? []
        return {
            possibleHabits,
            completedHabits
        }
    })

    app.patch("/habits/:id/toggle", async (request) => {
        const toggleHabitParams = z.object({
            id: z.string().uuid()
        })

        const { id } = toggleHabitParams.parse(request.params)
        const today = dayjs().startOf("day").toDate()

        let day = await prisma.day.findUnique({
            where: {
                date: today,
            }
        })

        if (!day) {
            day = await prisma.day.create({
                data: {
                    date: today,
                }
            })
        }

        const dayHabit = await prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id,
                }
            }
        })

        if (dayHabit) {
            await prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id,
                }
            })
        } else {
            // Completar o hábito
            await prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id,
                }
            })
        }
    })

    app.get("/summary", async () => {
        const summary = await prisma.$queryRaw`
            SELECT 
                D.id,
                D.date,
                (
                    SELECT 
                        cast(count(*) as float)
                    FROM day_habits DH
                    WHERE DH.day_id = D.id
                ) as completed,
                (
                    SELECT
                        cast(count(*) as float)
                    FROM habit_week_days HDW
                    JOIN habits H
                        ON H.id = HDW.habit_id
                    WHERE
                        HDW.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
                        AND H.created_at <= D.date
                ) as amount
            FROM days D
        `

        return summary
    })
}
