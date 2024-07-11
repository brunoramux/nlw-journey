import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import 'dayjs/locale/pt-br';
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from 'nodemailer';



export async function confirmTrip(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:id/confirm', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params

    const trip = await prisma.trip.findUnique({
      where: {
        id
      },
      include: {
        participants: {
          where: {
            is_owner: false
          }
        }
      }
    })

    if(!trip){
      throw new Error('Trip not found')
    }

    if(trip.is_confirmed){
      return reply.redirect(`http://localhost:3000/trips/${id}`)
    }

    await prisma.trip.update({
      where: {
        id
      },
      data: {
        is_confirmed: true
      }
    })

    // const participants = await prisma.participant.findMany({
    //   where: {
    //     trip_id: id,
    //     is_owner: false
    //   }
    // })

    let formattedDate = ""
    const formattedDateConcat = formattedDate.concat(dayjs(trip.starts_at).date().toString(), " a ", dayjs(trip.ends_at).date().toString(), " de ", dayjs(trip.starts_at).format('MMMM').toString(), " de ", dayjs(trip.starts_at).year().toString())
    const formattedStartDate = dayjs(trip.starts_at).format('LL').toString()
    const formattedEndDate = dayjs(trip.ends_at).format('LL').toString()
    const formattedDateConcat2 = formattedStartDate.concat(" a ", formattedEndDate)


    const mail = await getMailClient()

    await Promise.all(
      trip.participants.map(async (participant) => {
        const  confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`

        const message = await mail.sendMail({
          from: {
            name: 'Equipe plann.er',
            address: 'oi@plann.er',
          },
          to: participant.email,
          subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
          html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Você foi convidado para  uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${dayjs(trip.starts_at).get('month') === dayjs(trip.ends_at).get('month') &&  dayjs(trip.starts_at).get('year') === dayjs(trip.ends_at).get('year') ? formattedDateConcat : formattedDateConcat2}</strong></p>
    
              <p>Para confirmar sua presença, clique no link abaixo</p>
    
              <p>
                <a href="${confirmationLink}">Confirmar presença</a>
              </p>
    
              <p>Caso você não saiba do que se trata esse e-mail, apenas ignore.</p>
            </div>
          `.trim()
        })
    
        console.log(nodemailer.getTestMessageUrl(message))
      })
    )

   return reply.redirect(`http://localhost:3000/trips/${id}`)
  })
}