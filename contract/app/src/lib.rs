#![no_std]

use sails_rtl::gstd::gprogram;

pub mod service;

pub struct Program(());

#[gprogram]
impl Program {
    pub fn new() -> Self {
        service::GstdDrivenService::seed();
        Self(())
    }

    pub fn dns(&self) -> service::GstdDrivenService {
        service::GstdDrivenService::new()
    }
}
