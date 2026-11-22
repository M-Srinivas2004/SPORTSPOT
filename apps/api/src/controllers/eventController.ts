import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendSuccess, sendError } from '../utils/response';

export async function listEvents(req: Request, res: Response) {
  try {
    const { sport, search } = req.query;

    const where: any = {};
    if (sport && sport !== 'ALL') {
      where.sport = { contains: String(sport) };
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { location: { contains: String(search) } },
        { organizer: { contains: String(search) } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });

    return sendSuccess(res, events, 'Events retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to list events', 500);
  }
}

export async function createEvent(req: Request, res: Response) {
  try {
    const { title, sport, organizer, location, eventDate, description, registrationLink } =
      req.body;

    const event = await prisma.event.create({
      data: {
        title,
        sport,
        organizer,
        location,
        eventDate: new Date(eventDate),
        description,
        registrationLink: registrationLink || null,
        sponsorshipOpen: true,
      },
    });

    return sendSuccess(res, event, 'Event created successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create event', 500);
  }
}
