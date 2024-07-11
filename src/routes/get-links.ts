import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";


export async function getLinks(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:id/links', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request) => {
    const { id } = request.params

    const trip = await prisma.trip.findUnique({
      where: {
        id
      },
      include: {
        links: true
      }
    })

    if(!trip){
      throw new Error('Trip not found.')
    }
 

    return {links: trip.links}
  })
}