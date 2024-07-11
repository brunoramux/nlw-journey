import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";


export async function createActivity(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().post('/trips/:id/activities', {
    schema: {
      body: z.object({
        title: z.string(),
        occurs_at: z.coerce.date()
      }),
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request) => {
    const { occurs_at, title } = request.body
    const { id } = request.params

    const trip = await prisma.trip.findUnique({
      where: {
        id
      }
    })

    if(!trip){
      throw new Error('Trip not found.')
    }

    if(dayjs(occurs_at).isBefore(trip.starts_at)){
      throw new Error('Invalid activity date.')
    }

    if(dayjs(occurs_at).isAfter(trip.ends_at)){
      throw new Error('Invalid activity date.')
    }
    
    const activity = await prisma.activity.create({
      data: {
        title,
        occurs_at,
        trip_id: trip.id
      }
    })

    return {activityId: activity.id}
  })
}