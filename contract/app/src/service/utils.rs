use core::fmt::Debug;
use gstd::{ext, format, Decode, Encode, TypeInfo};
use sails_rtl::gstd::events::{EventTrigger, GStdEventTrigger};
use scale_info::StaticTypeInfo;

pub(crate) type Result<T, E = Error> = core::result::Result<T, E>;

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Encode, Decode, TypeInfo)]
pub enum Error {
    AccessDenied,
    NameAlreadyExists,
    Nonexistent,
    AddressAlreadyExists
}

pub fn panicking<T, E: Debug, F: FnOnce() -> Result<T, E>>(f: F) -> T {
    match f() {
        Ok(v) => v,
        Err(e) => panic(e),
    }
}

pub fn panic(err: impl Debug) -> ! {
    ext::panic(&format!("{err:?}"))
}

pub fn deposit_event<E: Encode + StaticTypeInfo>(event: E) {
    if GStdEventTrigger::<E>::new().trigger(event).is_err() {
        panic("Failed to deposit event");
    }
}
