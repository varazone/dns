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
    if data
        .active_contracts
        .values()
        .any(|info| info.program_id == program_id)
    {
        return Err(Error::AddressAlreadyExists);
    }
    let contract_info = ContractInfo {
        admins: vec![source],
        program_id,
        registration_time: get_date(block_timestamp),
    };
    data.active_contracts.insert(name, contract_info.clone());
    Ok(contract_info)
}

pub fn add_admin_to_program(
    data: &mut DnsData,
    name: String,
    new_admin: ActorId,
    source: ActorId,
) -> Result<ContractInfo> {
    let contract_info = data.active_contracts.get_mut(&name).ok_or(Error::Nonexistent)?;
    if !contract_info.admins.contains(&source) {
        return Err(Error::AccessDenied);
    };
    if contract_info.admins.contains(&new_admin) {
        return Err(Error::AdminAlreadyExists);
    };
    contract_info.admins.push(new_admin);
    Ok(contract_info.clone())
}

pub fn remove_admin_from_program(
    data: &mut DnsData,
    name: String,
    admin_to_remove: ActorId,
    source: ActorId,
) -> Result<ContractInfo> {
    let contract_info = data.active_contracts.get_mut(&name).ok_or(Error::Nonexistent)?;
    if !contract_info.admins.contains(&source) {
        return Err(Error::AccessDenied);
    };
    if contract_info.admins.len() == 1 {
        return Err(Error::MustbBeAtLeastOneAdmin);
    }
    contract_info.admins.retain(|&admin| admin != admin_to_remove);
    Ok(contract_info.clone())
}

pub fn delete_program(data: &mut DnsData, name: String, source: ActorId) -> Result<()> {
    let contract_info = data.active_contracts.get(&name).ok_or(Error::Nonexistent)?;
    if !contract_info.admins.contains(&source) && contract_info.program_id != source {
        return Err(Error::AccessDenied);
    }
    data.active_contracts.remove(&name);
    Ok(())
}

pub fn delete_me(data: &mut DnsData, source: ActorId) -> Result<String> {
    let name = data.active_contracts.iter().find_map(|(key, info)| {
        if info.program_id == source {
            Some(key.clone())
        } else {
            None
        }
    });

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
    if !contract_info.admins.contains(&source) && contract_info.program_id != source {
        return Err(Error::AccessDenied);
    }

    let date = get_date(block_timestamp);
    let new_contract_info = ContractInfo {
        admins: contract_info.admins.clone(),
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
