import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import 'dayjs/locale/pt-br';


export async function confirmTrip(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:id/confirm', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request) => {
    const { id } = request.params

   return {
    tripId: id
   }
  })
}