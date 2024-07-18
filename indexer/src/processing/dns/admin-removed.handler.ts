import { EntitiesService } from "../entities.service";
import { EventInfo } from "../event-info.type";
import { AdminAddedEvent, AdminRemovedEvent } from "../../types/dns.events";
import { IDNSEventHandler } from "./dns.handler";
import { Program } from "../../model";

export class AdminRemovedHandler implements IDNSEventHandler {
  async handle(
    event: AdminRemovedEvent,
    eventInfo: EventInfo,
    storage: EntitiesService,
  ): Promise<void> {
    const program = await storage.getProgram(event.name);
    if (program === undefined) {
      console.warn(`[AdminRemovedHandler] program not exists`);
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
