use super::utils::{Result, *};
use crate::service::{ContractInfo, DnsData};
use chrono_light::prelude::*;
use gstd::{prelude::*, ActorId};

pub fn add_new_program(
    data: &mut DnsData,
    name: String,
    program_id: ActorId,
    source: ActorId,
    block_timestamp: u64,
) -> Result<ContractInfo> {
    if data.active_contracts.contains_key(&name) {
        return Err(Error::NameAlreadyExists);
    }
    if data.active_contracts.values().any(|info| info.program_id == program_id) {
        return Err(Error::AddressAlreadyExists);
    }
    let contract_info = ContractInfo {
        admin: source,
        program_id,
        registration_time: get_date(block_timestamp),
    };
    data.active_contracts.insert(name, contract_info.clone());
    Ok(contract_info)
}

pub fn delete_program(data: &mut DnsData, name: String, source: ActorId) -> Result<()> {
    let contract_info = data.active_contracts.get(&name).ok_or(Error::Nonexistent)?;
    if contract_info.admin != source && contract_info.program_id != source {
        return Err(Error::AccessDenied);
    }
    data.active_contracts.remove(&name);
    Ok(())
}

pub fn delete_me(data: &mut DnsData, source: ActorId) -> Result<String> {
    let name = data.active_contracts.iter()
        .find_map(|(key, info)| if info.program_id == source { Some(key.clone()) } else { None });
    
    let name = name.ok_or(Error::Nonexistent)?;
    data.active_contracts.remove(&name);
    Ok(name)
}

pub fn change_program_id(
    data: &mut DnsData,
    name: String,
    new_program_id: ActorId,
    source: ActorId,
    block_timestamp: u64,
) -> Result<ContractInfo> {
    let contract_info = data.active_contracts.get(&name).ok_or(Error::Nonexistent)?;
    if contract_info.admin != source && contract_info.program_id != source {
        return Err(Error::AccessDenied);
    }

    let date = get_date(block_timestamp);
    let new_contract_info = ContractInfo {
        admin: contract_info.admin,
        program_id: new_program_id,
        registration_time: date,
    };
    data.active_contracts
        .insert(name, new_contract_info.clone())
        .unwrap();

    Ok(new_contract_info)
}

fn get_date(timestamp: u64) -> String {
    let DateTime {
        year,
        month,
        day,
        hour,
        minute,
        ..
    } = Calendar::create().from_unixtime(timestamp);
    format!("{year}-{month:02}-{day:02} {hour:02}:{minute:02}")
}
