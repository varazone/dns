import { Sails, getFnNamePrefix, getServiceNamePrefix } from "sails-js";
import { readFileSync } from "fs";
import { HexString } from "@gear-js/api";
import { ContractInfo } from "../dns-types/lib";

let instance: DnsEventsParser | undefined;

export async function getDnsEventsParser(): Promise<DnsEventsParser> {
  if (!instance) {
    instance = new DnsEventsParser();
    await instance.init();
  }
  return instance;
}

export enum DnsEventType {
  ProgramDeleted = "ProgramDeleted",
  NewProgramAdded = "NewProgramAdded",
  ProgramIdChanged = "ProgramIdChanged",
  AdminAdded = "AdminAdded",
  AdminRemoved = "AdminRemoved",
}

export type NewProgramAddedEvent = {
  type: DnsEventType.NewProgramAdded;
  program: string;
  name: string;
  admins: string[];
  createdAt: Date | null;
};

export type ProgramIdChangedEvent = {
  type: DnsEventType.ProgramIdChanged;
  program: string;
  name: string;
  admins: string[];
  updatedAt: Date | null;
};

export type ProgramDeletedEvent = {
  type: DnsEventType.ProgramDeleted;
  name: string;
};

export type AdminAddedEvent = {
  type: DnsEventType.AdminAdded;
  name: string;
  admins: string[];
};

export type AdminRemovedEvent = {
  type: DnsEventType.AdminRemoved;
  name: string;
  admins: string[];
};

export type DnsEvent =
  | ProgramDeletedEvent
  | NewProgramAddedEvent
  | ProgramIdChangedEvent
  | AdminAddedEvent
  | AdminRemovedEvent;

type ContractInfoChangedPayload = {
  name: string;
  contract_info: ContractInfo;
}

export class DnsEventsParser {
  private sails?: Sails;

  async init() {
    const idl = readFileSync("./assets/dns.idl", "utf-8");
    this.sails = await Sails.new();

    this.sails.parseIdl(idl);
  }

  getDnsEvent(payload: HexString): DnsEvent | undefined {
    if (!this.sails) {
      throw new Error(`sails is not initialized`);
    }
    const serviceName = getServiceNamePrefix(payload);
    const functionName = getFnNamePrefix(payload);
    if (!this.sails.services[serviceName].events[functionName]) {
      return undefined;
    }
    const ev =
      this.sails.services[serviceName].events[functionName].decode(payload);
    switch (functionName) {
      case "ProgramDeleted": {
        const event = ev as { name: string };
        return {
          type: DnsEventType.ProgramDeleted,
          name: event.name,
        };
      }
      case "NewProgramAdded": {
        const event = ev as ContractInfoChangedPayload;
        return {
          type: DnsEventType.NewProgramAdded,
          program: event.contract_info.program_id.toString(),
          admins: event.contract_info.admins.map((a) => a.toString()),
          name: event.name,
          createdAt: event.contract_info.registration_time
            ? new Date(event.contract_info.registration_time)
            : null,
        };
      }
      case "ProgramIdChanged": {
        const event = ev as ContractInfoChangedPayload;
        return {
          type: DnsEventType.ProgramIdChanged,
          program: event.contract_info.program_id.toString(),
          admins: event.contract_info.admins.map((a) => a.toString()),
          name: event.name,
          updatedAt: event.contract_info.registration_time
            ? new Date(event.contract_info.registration_time)
            : null,
        };
      }
      case "AdminAdded": {
        const event = ev as {
          name: string;
          contract_info: ContractInfo;
        };
        return {
          type: DnsEventType.AdminAdded,
          admins: event.contract_info.admins.map((a) => a.toString()),
          name: event.name,
        };
      }
      case "AdminRemoved": {
        const event = ev as ContractInfoChangedPayload;
        return {
          type: DnsEventType.AdminRemoved,
          admins: event.contract_info.admins.map((a) => a.toString()),
          name: event.name,
        };
      }
    }
    return undefined;
  }
}
