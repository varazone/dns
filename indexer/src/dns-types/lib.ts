// @ts-nocheck
import { GearApi, decodeAddress } from "@gear-js/api";
import { TypeRegistry } from "@polkadot/types";
import { TransactionBuilder } from "sails-js";
import { u8aToHex, compactFromU8aLim } from "@polkadot/util";

const ZERO_ADDRESS = u8aToHex(new Uint8Array(32));

export interface ContractInfo {
  admins: Array<`0x${string}` | Uint8Array>;
  program_id: `0x${string}` | Uint8Array;
  registration_time: string;
}

export class Program {
  private registry: TypeRegistry;
  constructor(
    public api: GearApi,
    public programId?: `0x${string}`,
  ) {
    const types: Record<string, any> = {
      ContractInfo: {
        admins: "Vec<[u8;32]>",
        program_id: "[u8;32]",
        registration_time: "String",
      },
    };

    this.registry = new TypeRegistry();
    this.registry.setKnownTypes({ types });
    this.registry.register(types);
  }

  newCtorFromCode(code: Uint8Array | Buffer): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      "upload_program",
      "New",
      "String",
      "String",
      code,
    );

    this.programId = builder.programId;
    return builder;
  }

  newCtorFromCodeId(codeId: `0x${string}`) {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      "create_program",
      "New",
      "String",
      "String",
      codeId,
    );

    this.programId = builder.programId;
    return builder;
  }

  public addAdminToProgram(
    name: string,
    new_admin: `0x${string}` | Uint8Array,
  ): TransactionBuilder<null> {
    return new TransactionBuilder<null>(
      this.api,
      this.registry,
      "send_message",
      ["AddAdminToProgram", name, new_admin],
      "(String, String, [u8;32])",
      "Null",
      this.programId,
    );
  }

  public addNewProgram(
    name: string,
    program_id: `0x${string}` | Uint8Array,
  ): TransactionBuilder<null> {
    return new TransactionBuilder<null>(
      this.api,
      this.registry,
      "send_message",
      ["AddNewProgram", name, program_id],
      "(String, String, [u8;32])",
      "Null",
      this.programId,
    );
  }

  public changeProgramId(
    name: string,
    new_program_id: `0x${string}` | Uint8Array,
  ): TransactionBuilder<null> {
    return new TransactionBuilder<null>(
      this.api,
      this.registry,
      "send_message",
      ["ChangeProgramId", name, new_program_id],
      "(String, String, [u8;32])",
      "Null",
      this.programId,
    );
  }

  public deleteMe(): TransactionBuilder<null> {
    return new TransactionBuilder<null>(
      this.api,
      this.registry,
      "send_message",
      "DeleteMe",
      "String",
      "Null",
      this.programId,
    );
  }

  public deleteProgram(name: string): TransactionBuilder<null> {
    return new TransactionBuilder<null>(
      this.api,
      this.registry,
      "send_message",
      ["DeleteProgram", name],
      "(String, String)",
      "Null",
      this.programId,
    );
  }

  public removeAdminFromProgram(
    name: string,
    admin_to_remove: `0x${string}` | Uint8Array,
  ): TransactionBuilder<null> {
    return new TransactionBuilder<null>(
      this.api,
      this.registry,
      "send_message",
      ["RemoveAdminFromProgram", name, admin_to_remove],
      "(String, String, [u8;32])",
      "Null",
      this.programId,
    );
  }

  public async allContracts(
    originAddress: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<Array<[string, ContractInfo]>> {
    const payload = this.registry.createType("String", "AllContracts").toU8a();
    const reply = await this.api.message.calculateReply({
      destination: this.programId,
      origin: decodeAddress(originAddress),
      payload,
      value: value || 0,
      gasLimit: this.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    const result = this.registry.createType(
      "(String, Vec<(String, ContractInfo)>)",
      reply.payload,
    );
    return result[1].toJSON() as unknown as Array<[string, ContractInfo]>;
  }

  public async getAllAddresses(
    originAddress: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<Array<`0x${string}` | Uint8Array>> {
    const payload = this.registry
      .createType("String", "GetAllAddresses")
      .toU8a();
    const reply = await this.api.message.calculateReply({
      destination: this.programId,
      origin: decodeAddress(originAddress),
      payload,
      value: value || 0,
      gasLimit: this.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    const result = this.registry.createType(
      "(String, Vec<[u8;32]>)",
      reply.payload,
    );
    return result[1].toJSON() as unknown as Array<`0x${string}` | Uint8Array>;
  }

  public async getAllNames(
    originAddress: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<Array<string>> {
    const payload = this.registry.createType("String", "GetAllNames").toU8a();
    const reply = await this.api.message.calculateReply({
      destination: this.programId,
      origin: decodeAddress(originAddress),
      payload,
      value: value || 0,
      gasLimit: this.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    const result = this.registry.createType(
      "(String, Vec<String>)",
      reply.payload,
    );
    return result[1].toJSON() as unknown as Array<string>;
  }

  public async getContractInfoByName(
    name: string,
    originAddress: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<ContractInfo | null> {
    const payload = this.registry
      .createType("(String, String)", ["GetContractInfoByName", name])
      .toU8a();
    const reply = await this.api.message.calculateReply({
      destination: this.programId,
      origin: decodeAddress(originAddress),
      payload,
      value: value || 0,
      gasLimit: this.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    const result = this.registry.createType(
      "(String, Option<ContractInfo>)",
      reply.payload,
    );
    return result[1].toJSON() as unknown as ContractInfo | null;
  }

  public async getNameByProgramId(
    program_id: `0x${string}` | Uint8Array,
    originAddress: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<string | null> {
    const payload = this.registry
      .createType("(String, [u8;32])", ["GetNameByProgramId", program_id])
      .toU8a();
    const reply = await this.api.message.calculateReply({
      destination: this.programId,
      origin: decodeAddress(originAddress),
      payload,
      value: value || 0,
      gasLimit: this.api.blockGasLimit.toBigInt(),
      at: atBlock || null,
    });
    const result = this.registry.createType(
      "(String, Option<String>)",
      reply.payload,
    );
    return result[1].toJSON() as unknown as string | null;
  }

  public subscribeToNewProgramAddedEvent(
    callback: (data: {
      name: string;
      contract_info: ContractInfo;
    }) => void | Promise<void>,
  ): Promise<() => void> {
    return this.api.gearEvents.subscribeToGearEvent(
      "UserMessageSent",
      ({ data: { message } }) => {
        if (
          !message.source.eq(this.programId) ||
          !message.destination.eq(ZERO_ADDRESS)
        ) {
          return;
        }

        const payload = message.payload.toU8a();
        const [offset, limit] = compactFromU8aLim(payload);
        const name = this.registry
          .createType("String", payload.subarray(offset, limit))
          .toString();
        if (name === "NewProgramAdded") {
          callback(
            this.registry
              .createType(
                '(String, {"name":"String","contract_info":"ContractInfo"})',
                message.payload,
              )[1]
              .toJSON() as { name: string; contract_info: ContractInfo },
          );
        }
      },
    );
  }

  public subscribeToProgramIdChangedEvent(
    callback: (data: {
      name: string;
      contract_info: ContractInfo;
    }) => void | Promise<void>,
  ): Promise<() => void> {
    return this.api.gearEvents.subscribeToGearEvent(
      "UserMessageSent",
      ({ data: { message } }) => {
        if (
          !message.source.eq(this.programId) ||
          !message.destination.eq(ZERO_ADDRESS)
        ) {
          return;
        }

        const payload = message.payload.toU8a();
        const [offset, limit] = compactFromU8aLim(payload);
        const name = this.registry
          .createType("String", payload.subarray(offset, limit))
          .toString();
        if (name === "ProgramIdChanged") {
          callback(
            this.registry
              .createType(
                '(String, {"name":"String","contract_info":"ContractInfo"})',
                message.payload,
              )[1]
              .toJSON() as { name: string; contract_info: ContractInfo },
          );
        }
      },
    );
  }

  public subscribeToProgramDeletedEvent(
    callback: (data: { name: string }) => void | Promise<void>,
  ): Promise<() => void> {
    return this.api.gearEvents.subscribeToGearEvent(
      "UserMessageSent",
      ({ data: { message } }) => {
        if (
          !message.source.eq(this.programId) ||
          !message.destination.eq(ZERO_ADDRESS)
        ) {
          return;
        }

        const payload = message.payload.toU8a();
        const [offset, limit] = compactFromU8aLim(payload);
        const name = this.registry
          .createType("String", payload.subarray(offset, limit))
          .toString();
        if (name === "ProgramDeleted") {
          callback(
            this.registry
              .createType('(String, {"name":"String"})', message.payload)[1]
              .toJSON() as { name: string },
          );
        }
      },
    );
  }

  public subscribeToAdminAddedEvent(
    callback: (data: {
      name: string;
      contract_info: ContractInfo;
    }) => void | Promise<void>,
  ): Promise<() => void> {
    return this.api.gearEvents.subscribeToGearEvent(
      "UserMessageSent",
      ({ data: { message } }) => {
        if (
          !message.source.eq(this.programId) ||
          !message.destination.eq(ZERO_ADDRESS)
        ) {
          return;
        }

        const payload = message.payload.toU8a();
        const [offset, limit] = compactFromU8aLim(payload);
        const name = this.registry
          .createType("String", payload.subarray(offset, limit))
          .toString();
        if (name === "AdminAdded") {
          callback(
            this.registry
              .createType(
                '(String, {"name":"String","contract_info":"ContractInfo"})',
                message.payload,
              )[1]
              .toJSON() as { name: string; contract_info: ContractInfo },
          );
        }
      },
    );
  }

  public subscribeToAdminRemovedEvent(
    callback: (data: {
      name: string;
      contract_info: ContractInfo;
    }) => void | Promise<void>,
  ): Promise<() => void> {
    return this.api.gearEvents.subscribeToGearEvent(
      "UserMessageSent",
      ({ data: { message } }) => {
        if (
          !message.source.eq(this.programId) ||
          !message.destination.eq(ZERO_ADDRESS)
        ) {
          return;
        }

        const payload = message.payload.toU8a();
        const [offset, limit] = compactFromU8aLim(payload);
        const name = this.registry
          .createType("String", payload.subarray(offset, limit))
          .toString();
        if (name === "AdminRemoved") {
          callback(
            this.registry
              .createType(
                '(String, {"name":"String","contract_info":"ContractInfo"})',
                message.payload,
              )[1]
              .toJSON() as { name: string; contract_info: ContractInfo },
          );
        }
      },
    );
  }
}
