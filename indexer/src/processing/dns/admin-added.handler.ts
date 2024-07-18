import { EntitiesService } from "../entities.service";
import { EventInfo } from "../event-info.type";
import { AdminAddedEvent } from "../../types/dns.events";
import { IDNSEventHandler } from "./dns.handler";
import { Program } from "../../model";

export class AdminAddedHandler implements IDNSEventHandler {
  async handle(
    event: AdminAddedEvent,
    eventInfo: EventInfo,
    storage: EntitiesService,
  ): Promise<void> {
    const program = await storage.getProgram(event.name);
    if (program === undefined) {
      console.warn(`[AdminAddedHandler] program not exists`);
      return;
    }
    await storage.setProgram(
      new Program({
        ...program,
        admins: event.admins,
        updatedAt: eventInfo.timestamp,
      }),
    );
  }
}
