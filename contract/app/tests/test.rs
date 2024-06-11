use gtest::{Program, System};
pub const USERS: &[u64] = &[3, 4, 5];
use dns::service::ContractInfo;
use gstd::{ActorId, Encode};

#[macro_export]
macro_rules! send_request {
    (dns: $dns: expr, user: $user: expr, service_name: $name: literal, action: $action: literal, payload: ($($val: expr),*)) => {
        {
            let request = [
                $name.encode(),
                $action.to_string().encode(),
                ( $( $val, )*).encode(),
            ]
            .concat();

            $dns.send_bytes($user, request)

        }

    };
}

pub fn init(sys: &System) -> Program {
    let dns = Program::from_file(
        &sys,
        "../target/wasm32-unknown-unknown/release/dns_wasm.opt.wasm",
    );
    let request = ["New".encode(), ().encode()].concat();
    let res = dns.send_bytes(USERS[0], request);
    assert!(!res.main_failed());

    dns
}

pub fn get_state_all_contracts(dns: &Program) {
    let request = [
        "Dns".encode(),
        "AllContracts".to_string().encode(),
        ().encode(),
    ]
    .concat();
    let state = dns.send_bytes(USERS[0], request);
    let state = &state.decoded_log::<(String, String, Vec<(String, ContractInfo)>)>();

    println!("\nstate {:?}", state);
}


#[test]
fn test_add_new_program() {
    let sys = System::new();
    sys.init_logger();
    let dns = init(&sys);

    let name = "New Name".to_string();
    let program_id: ActorId = 100.into();
    let res = send_request!(dns: dns, user: USERS[0], service_name: "Dns", action: "AddNewProgram", payload: (name.clone(), program_id));
    assert!(!res.main_failed());

    get_state_all_contracts(&dns);

    let res = send_request!(dns: dns, user: USERS[0], service_name: "Dns", action: "AddNewProgram", payload: (name.clone(), program_id));
    assert!(res.main_failed());
}

#[test]
fn test_change_program_id() {
    let sys = System::new();
    sys.init_logger();
    let dns = init(&sys);

    let name = "New Name".to_string();
    let program_id: ActorId = 100.into();
    let res = send_request!(dns: dns, user: USERS[0], service_name: "Dns", action: "AddNewProgram", payload: (name.clone(), program_id));
    assert!(!res.main_failed());
    get_state_all_contracts(&dns);

    let new_program_id: ActorId = 101.into();
    let res = send_request!(dns: dns, user: USERS[0], service_name: "Dns", action: "ChangeProgramId", payload: (name.clone(), new_program_id));
    assert!(!res.main_failed());
    get_state_all_contracts(&dns);
}
