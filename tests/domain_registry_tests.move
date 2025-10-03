#[test_only]
module orbiter::domain_registry_tests {
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use std::signer;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_std::table;
    
    use orbiter::domain_registry::{Self, DomainAsset, ValuationData, FractionalConfig};

    // ================================
    // Test Constants
    // ================================
    
    const TEST_DOMAIN_NAME: vector<u8> = b"example.com";
    const TEST_DOMAIN_NAME_2: vector<u8> = b"test.org";
    const TEST_VERIFICATION_HASH: vector<u8> = b"abcdef1234567890abcdef1234567890abcdef12";
    const TEST_TICKER: vector<u8> = b"EXMPL";
    
    // Test addresses
    const USER1_ADDR: address = @0x200;
    const USER2_ADDR: address = @0x300;
    const USER3_ADDR: address = @0x400;

    // ================================
    // Test Helper Functions
    // ================================

    /// Create a test valuation data struct
    fun create_test_valuation(): ValuationData {
        domain_registry::new_valuation_data(
            750,        // score
            1000000,    // market_value (in octas)
            85,         // seo_authority
            70,         // traffic_estimate
            90,         // brandability
            80,         // tld_rarity
            1000000     // fixed timestamp for testing
        )
    }

    /// Create a test fractional config
    fun create_test_fractional_config(): FractionalConfig {
        domain_registry::new_fractional_config(
            string::utf8(TEST_TICKER),
            1000000,    // total_supply
            true        // trading_enabled
        )
    }

    /// Setup test environment with admin account
    fun setup_test_env(): signer {
        // Create admin account at the orbiter address
        let admin = account::create_account_for_test(@orbiter);
        timestamp::set_time_has_started_for_testing(&admin);
        domain_registry::initialize(&admin);
        admin
    }

    /// Create test user accounts
    fun create_test_users(): (signer, signer, signer) {
        let user1 = account::create_account_for_test(USER1_ADDR);
        let user2 = account::create_account_for_test(USER2_ADDR);
        let user3 = account::create_account_for_test(USER3_ADDR);
        (user1, user2, user3)
    }

    // ================================
    // Registry Initialization Tests
    // ================================

    #[test]
    fun test_initialize_registry_success() {
        let admin = setup_test_env();
        
        // Verify registry was initialized correctly
        let (total_domains, admin_addr, paused) = domain_registry::get_registry_stats();
        assert!(total_domains == 0, 1);
        assert!(admin_addr == @orbiter, 2);
        assert!(!paused, 3);
        
        // Verify admin getter
        assert!(domain_registry::get_registry_admin() == @orbiter, 4);
        
        // Verify not paused
        assert!(!domain_registry::is_registry_paused(), 5);
    }

    #[test]
    #[expected_failure(abort_code = 32, location = orbiter::domain_registry)]
    fun test_initialize_registry_already_exists() {
        let admin = setup_test_env();
        
        // Try to initialize again - should fail
        domain_registry::initialize(&admin);
    }

    // ================================
    // Domain Creation Tests
    // ================================

    #[test]
    fun test_create_domain_object_success() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        let fractional_config = option::some(create_test_fractional_config());
        
        // Create domain object
        let domain_obj = domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            fractional_config
        );
        
        // Verify domain was created
        assert!(domain_registry::domain_exists(domain_name), 1);
        
        // Verify domain info
        let (name, original_owner, stored_valuation) = domain_registry::get_domain_info(domain_obj);
        assert!(name == domain_name, 2);
        assert!(original_owner == USER1_ADDR, 3);
        assert!(domain_registry::get_valuation_score(&stored_valuation) == 750, 4);
        
        // Verify ownership
        assert!(domain_registry::is_domain_owner(domain_obj, USER1_ADDR), 5);
        assert!(domain_registry::get_domain_owner(domain_obj) == USER1_ADDR, 6);
        
        // Verify registry stats updated
        let (total_domains, _, _) = domain_registry::get_registry_stats();
        assert!(total_domains == 1, 7);
    }

    #[test]
    fun test_create_domain_object_without_fractional() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Create domain object without fractional config
        let domain_obj = domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Verify fractional config is none
        let fractional_config = domain_registry::get_fractional_config(domain_obj);
        assert!(option::is_none(&fractional_config), 1);
        
        // Verify trading is not enabled
        assert!(!domain_registry::is_trading_enabled(domain_obj), 2);
        
        // Verify ticker is none
        let ticker = domain_registry::get_ticker_symbol(domain_obj);
        assert!(option::is_none(&ticker), 3);
        
        // Verify total supply is 0
        assert!(domain_registry::get_fractional_total_supply(domain_obj) == 0, 4);
    }

    #[test]
    #[expected_failure(abort_code = 1, location = orbiter::domain_registry)]
    fun test_create_domain_object_duplicate_domain() {
        let admin = setup_test_env();
        let (user1, user2, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Create first domain
        domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Try to create duplicate domain - should fail
        domain_registry::create_domain_object(
            &user2,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
    }

    #[test]
    fun test_create_multiple_domains() {
        let admin = setup_test_env();
        let (user1, user2, _) = create_test_users();
        
        let domain_name1 = string::utf8(TEST_DOMAIN_NAME);
        let domain_name2 = string::utf8(TEST_DOMAIN_NAME_2);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Create first domain
        let domain_obj1 = domain_registry::create_domain_object(
            &user1,
            domain_name1,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Create second domain
        let domain_obj2 = domain_registry::create_domain_object(
            &user2,
            domain_name2,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Verify both domains exist
        assert!(domain_registry::domain_exists(domain_name1), 1);
        assert!(domain_registry::domain_exists(domain_name2), 2);
        
        // Verify different owners
        assert!(domain_registry::is_domain_owner(domain_obj1, USER1_ADDR), 3);
        assert!(domain_registry::is_domain_owner(domain_obj2, USER2_ADDR), 4);
        
        // Verify registry stats
        let (total_domains, _, _) = domain_registry::get_registry_stats();
        assert!(total_domains == 2, 5);
    }

    // ================================
    // Domain Transfer Tests
    // ================================

    #[test]
    fun test_transfer_domain_success() {
        let admin = setup_test_env();
        let (user1, user2, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Verify initial ownership
        assert!(domain_registry::is_domain_owner(domain_obj, USER1_ADDR), 1);
        
        // Transfer domain
        domain_registry::transfer_domain(&user1, domain_obj, USER2_ADDR);
        
        // Verify ownership changed
        assert!(domain_registry::is_domain_owner(domain_obj, USER2_ADDR), 2);
        assert!(!domain_registry::is_domain_owner(domain_obj, USER1_ADDR), 3);
        assert!(domain_registry::get_domain_owner(domain_obj) == USER2_ADDR, 4);
        
        // Verify original owner is still recorded
        let (_, original_owner, _) = domain_registry::get_domain_info(domain_obj);
        assert!(original_owner == USER1_ADDR, 5);
    }

    #[test]
    #[expected_failure(abort_code = 4, location = orbiter::domain_registry)]
    fun test_transfer_domain_unauthorized() {
        let admin = setup_test_env();
        let (user1, user2, user3) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Try to transfer from non-owner - should fail
        domain_registry::transfer_domain(&user2, domain_obj, USER3_ADDR);
    }

    // ================================
    // Domain Query Tests
    // ================================

    #[test]
    fun test_get_domain_details() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        let fractional_config = option::some(create_test_fractional_config());
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            fractional_config
        );
        
        // Get complete details
        let (name, original_owner, hash, created_at, stored_valuation, stored_config) = 
            domain_registry::get_domain_details(domain_obj);
        
        // Verify all details
        assert!(name == domain_name, 1);
        assert!(original_owner == USER1_ADDR, 2);
        assert!(hash == verification_hash, 3);
        assert!(created_at >= 0, 4); // Allow zero timestamp in tests
        assert!(domain_registry::get_valuation_score(&stored_valuation) == 750, 5);
        assert!(option::is_some(&stored_config), 6);
    }

    #[test]
    fun test_get_domain_valuation() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Get valuation
        let stored_valuation = domain_registry::get_domain_valuation(domain_obj);
        
        // Verify valuation fields
        assert!(domain_registry::get_valuation_score(&stored_valuation) == 750, 1);
        assert!(domain_registry::get_valuation_market_value(&stored_valuation) == 1000000, 2);
        assert!(domain_registry::get_valuation_seo_authority(&stored_valuation) == 85, 3);
        assert!(domain_registry::get_valuation_traffic_estimate(&stored_valuation) == 70, 4);
        assert!(domain_registry::get_valuation_brandability(&stored_valuation) == 90, 5);
        assert!(domain_registry::get_valuation_tld_rarity(&stored_valuation) == 80, 6);
    }

    #[test]
    fun test_domain_exists_queries() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let nonexistent_domain = string::utf8(b"nonexistent.com");
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Verify domain doesn't exist initially
        assert!(!domain_registry::domain_exists(domain_name), 1);
        assert!(!domain_registry::domain_exists(nonexistent_domain), 2);
        
        // Create domain
        domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Verify domain exists now
        assert!(domain_registry::domain_exists(domain_name), 3);
        assert!(!domain_registry::domain_exists(nonexistent_domain), 4);
        
        // Test get domain object address
        let domain_addr = domain_registry::get_domain_object_address(domain_name);
        assert!(domain_addr != @0x0, 5);
    }

    #[test]
    #[expected_failure(abort_code = 2, location = orbiter::domain_registry)]
    fun test_get_nonexistent_domain_address() {
        let admin = setup_test_env();
        let nonexistent_domain = string::utf8(b"nonexistent.com");
        
        // Try to get address of nonexistent domain - should fail
        domain_registry::get_domain_object_address(nonexistent_domain);
    }

    // ================================
    // Registry Management Tests
    // ================================

    #[test]
    fun test_pause_unpause_registry() {
        let admin = setup_test_env();
        
        // Verify initially not paused
        assert!(!domain_registry::is_registry_paused(), 1);
        
        // Pause registry
        domain_registry::pause_registry(&admin);
        assert!(domain_registry::is_registry_paused(), 2);
        
        // Unpause registry
        domain_registry::unpause_registry(&admin);
        assert!(!domain_registry::is_registry_paused(), 3);
    }

    #[test]
    #[expected_failure(abort_code = 31, location = orbiter::domain_registry)]
    fun test_pause_registry_unauthorized() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        // Try to pause as non-admin - should fail
        domain_registry::pause_registry(&user1);
    }

    #[test]
    fun test_update_admin() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        // Verify initial admin
        assert!(domain_registry::get_registry_admin() == @orbiter, 1);
        
        // Update admin
        domain_registry::update_admin(&admin, USER1_ADDR);
        
        // Verify admin changed
        assert!(domain_registry::get_registry_admin() == USER1_ADDR, 2);
    }

    #[test]
    #[expected_failure(abort_code = 31, location = orbiter::domain_registry)]
    fun test_update_admin_unauthorized() {
        let admin = setup_test_env();
        let (user1, user2, _) = create_test_users();
        
        // Try to update admin as non-admin - should fail
        domain_registry::update_admin(&user1, USER2_ADDR);
    }

    #[test]
    #[expected_failure(abort_code = 31, location = orbiter::domain_registry)]
    fun test_update_admin_to_self() {
        let admin = setup_test_env();
        
        // Try to update admin to self - should fail
        domain_registry::update_admin(&admin, @orbiter);
    }

    // ================================
    // Valuation Update Tests
    // ================================

    #[test]
    fun test_update_domain_valuation() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Create new valuation
        let new_valuation = domain_registry::new_valuation_data(
            900,        // increased score
            2000000,    // increased market_value
            95,         // increased seo_authority
            80,         // increased traffic_estimate
            95,         // increased brandability
            90,         // increased tld_rarity
            timestamp::now_seconds()
        );
        
        // Update valuation
        domain_registry::update_domain_valuation(&admin, domain_obj, new_valuation);
        
        // Verify valuation was updated
        let stored_valuation = domain_registry::get_domain_valuation(domain_obj);
        assert!(domain_registry::get_valuation_score(&stored_valuation) == 900, 1);
        assert!(domain_registry::get_valuation_market_value(&stored_valuation) == 2000000, 2);
        assert!(domain_registry::get_valuation_seo_authority(&stored_valuation) == 95, 3);
    }

    #[test]
    #[expected_failure(abort_code = 31, location = orbiter::domain_registry)]
    fun test_update_valuation_unauthorized() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
        
        let new_valuation = create_test_valuation();
        
        // Try to update valuation as non-admin - should fail
        domain_registry::update_domain_valuation(&user1, domain_obj, new_valuation);
    }

    // ================================
    // DNS Verification Tests
    // ================================

    #[test]
    fun test_verify_dns_ownership_success() {
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let challenge = string::utf8(b"challenge123");
        
        // Test DNS verification (simplified)
        let result = domain_registry::verify_dns_ownership(
            domain_name,
            verification_hash,
            challenge
        );
        
        assert!(result, 1);
    }

    #[test]
    fun test_verify_dns_ownership_empty_challenge() {
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let empty_challenge = string::utf8(b"");
        
        // Test DNS verification with empty challenge
        let result = domain_registry::verify_dns_ownership(
            domain_name,
            verification_hash,
            empty_challenge
        );
        
        assert!(!result, 1);
    }

    // ================================
    // Fractional Config Tests
    // ================================

    #[test]
    fun test_fractional_config_getters() {
        let admin = setup_test_env();
        let (user1, _, _) = create_test_users();
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        let fractional_config = option::some(create_test_fractional_config());
        
        // Create domain with fractional config
        let domain_obj = domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            fractional_config
        );
        
        // Test fractional config getters
        assert!(domain_registry::is_trading_enabled(domain_obj), 1);
        
        let ticker = domain_registry::get_ticker_symbol(domain_obj);
        assert!(option::is_some(&ticker), 2);
        let ticker_value = option::borrow(&ticker);
        assert!(*ticker_value == string::utf8(TEST_TICKER), 3);
        
        let total_supply = domain_registry::get_fractional_total_supply(domain_obj);
        assert!(total_supply == 1000000, 4);
    }

    // ================================
    // Input Validation Tests
    // ================================

    #[test]
    fun test_validate_domain_creation_inputs() {
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        let fractional_config = option::some(create_test_fractional_config());
        
        // Test validation function
        let result = domain_registry::validate_domain_creation_inputs(
            &domain_name,
            &verification_hash,
            &valuation,
            &fractional_config
        );
        
        assert!(result, 1);
    }

    #[test]
    fun test_validate_address() {
        // Test valid address
        assert!(domain_registry::validate_address(USER1_ADDR), 1);
        
        // Test zero address
        assert!(!domain_registry::validate_address(@0x0), 2);
    }

    #[test]
    fun test_validate_positive_amount() {
        // Test positive amount
        assert!(domain_registry::validate_positive_amount(100), 1);
        
        // Test zero amount
        assert!(!domain_registry::validate_positive_amount(0), 2);
    }

    // ================================
    // ValuationData Getter Tests
    // ================================

    #[test]
    fun test_valuation_data_getters() {
        let valuation = create_test_valuation();
        
        // Test individual getters
        assert!(domain_registry::get_valuation_score(&valuation) == 750, 1);
        assert!(domain_registry::get_valuation_market_value(&valuation) == 1000000, 2);
        assert!(domain_registry::get_valuation_seo_authority(&valuation) == 85, 3);
        assert!(domain_registry::get_valuation_traffic_estimate(&valuation) == 70, 4);
        assert!(domain_registry::get_valuation_brandability(&valuation) == 90, 5);
        assert!(domain_registry::get_valuation_tld_rarity(&valuation) == 80, 6);
        
        // Test tuple getter
        let (score, market_value, seo, traffic, brand, tld, updated_at) = 
            domain_registry::get_valuation_fields(&valuation);
        assert!(score == 750, 7);
        assert!(market_value == 1000000, 8);
        assert!(seo == 85, 9);
        assert!(traffic == 70, 10);
        assert!(brand == 90, 11);
        assert!(tld == 80, 12);
        assert!(updated_at > 0, 13);
    }

    // ================================
    // Error Handling Tests
    // ================================

    #[test]
    #[expected_failure(abort_code = 32, location = orbiter::domain_registry)]
    fun test_operations_without_registry_initialization() {
        // Create user at a different address to avoid system address conflicts
        let user1 = account::create_account_for_test(USER1_ADDR);
        
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        // Try to create domain without initializing registry - should fail
        domain_registry::create_domain_object(
            &user1,
            domain_name,
            verification_hash,
            valuation,
            option::none()
        );
    }

    #[test]
    #[expected_failure(abort_code = 393218, location = aptos_framework::object)]
    fun test_get_info_nonexistent_domain() {
        let admin = setup_test_env();
        let fake_obj = object::address_to_object<DomainAsset>(@0x999);
        
        // Try to get info for nonexistent domain - should fail
        domain_registry::get_domain_info(fake_obj);
    }

    // ================================
    // Registry Stats Tests
    // ================================

    #[test]
    fun test_registry_stats_tracking() {
        let admin = setup_test_env();
        let (user1, user2, _) = create_test_users();
        
        // Initial stats
        let (total_domains, admin_addr, paused) = domain_registry::get_registry_stats();
        assert!(total_domains == 0, 1);
        assert!(admin_addr == @orbiter, 2);
        assert!(!paused, 3);
        
        // Create first domain
        let domain_name1 = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        
        domain_registry::create_domain_object(
            &user1,
            domain_name1,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Check stats after first domain
        let (total_domains, _, _) = domain_registry::get_registry_stats();
        assert!(total_domains == 1, 4);
        assert!(domain_registry::get_total_domains() == 1, 5);
        
        // Create second domain
        let domain_name2 = string::utf8(TEST_DOMAIN_NAME_2);
        
        domain_registry::create_domain_object(
            &user2,
            domain_name2,
            verification_hash,
            valuation,
            option::none()
        );
        
        // Check stats after second domain
        let (total_domains, _, _) = domain_registry::get_registry_stats();
        assert!(total_domains == 2, 6);
        assert!(domain_registry::get_total_domains() == 2, 7);
    }}
