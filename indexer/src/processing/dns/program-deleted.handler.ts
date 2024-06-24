import { EntitiesService } from "../entities.service";
import { EventInfo } from "../event-info.type";
import { IDNSEventHandler } from "./dns.handler";
import { ProgramDeletedEvent } from '../../types/dns.events';

export class ProgramDeletedHandler implements IDNSEventHandler {
  async handle(
    event: ProgramDeletedEvent,
    eventInfo: EventInfo,
    storage: EntitiesService,
  ): Promise<void> {
    const { name } = event;
    const program = await storage.getProgram(name);
    if (program === undefined) {
      console.warn(`[ProgramDeletedHandler] not found`);
      return;
    }
    await storage.deleteProgram(program);
  }
}
