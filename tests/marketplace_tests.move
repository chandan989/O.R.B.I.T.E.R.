/// Comprehensive unit tests for the marketplace module
/// 
/// This test suite covers:
/// 1. Marketplace initialization and configuration
/// 2. Listing creation, modification, and cancellation
/// 3. Trade execution and settlement mechanics
/// 4. Fee calculation and payment processing
/// 5. Marketplace statistics and query functions
/// 6. Access control and security measures
/// 7. Edge cases and error conditions
/// 8. Integration tests with other modules
#[test_only]
module orbiter::marketplace_tests {
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use std::signer;
    use std::vector;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_std::table;
    
    use orbiter::domain_registry::{Self, DomainAsset, ValuationData, FractionalConfig};
    use orbiter::fractional;
    use orbiter::marketplace::{Self, ShareListing};

    // ================================
    // Test Constants
    // ================================
    
    const TEST_DOMAIN_NAME: vector<u8> = b"example.com";
    const TEST_DOMAIN_NAME_2: vector<u8> = b"test.org";
    const TEST_VERIFICATION_HASH: vector<u8> = b"abcdef1234567890abcdef1234567890abcdef12";
    const TEST_TICKER: vector<u8> = b"EXMPL";
    const TEST_TICKER_2: vector<u8> = b"TEST";
    
    // Test addresses
    const USER1_ADDR: address = @0x200;
    const USER2_ADDR: address = @0x300;
    const USER3_ADDR: address = @0x400;
    const USER4_ADDR: address = @0x500;
    const FEE_COLLECTOR_ADDR: address = @0x600;

    // Test amounts
    const TOTAL_SUPPLY: u64 = 1000000;
    const SHARES_TO_LIST: u64 = 100000;
    const SHARES_TO_BUY: u64 = 50000;
    const PRICE_PER_SHARE: u64 = 1000000; // 0.01 APT in octas
    const TRADING_FEE_BPS: u64 = 250; // 2.5%
    const INITIAL_BALANCE: u64 = 100000000000; // 1000 APT in octas

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
            timestamp::now_seconds()
        )
    }

    /// Create a test fractional config
    fun create_test_fractional_config(): FractionalConfig {
        domain_registry::new_fractional_config(
            string::utf8(TEST_TICKER),
            TOTAL_SUPPLY,
            true        // trading_enabled
        )
    }

    /// Setup test environment with admin account and marketplace
    fun setup_test_env(): signer {
        // Create admin account at the orbiter address
        let admin = account::create_account_for_test(@orbiter);
        timestamp::set_time_has_started_for_testing(&admin);
        
        // Initialize domain registry
        domain_registry::initialize(&admin);
        
        // Initialize marketplace
        marketplace::initialize_marketplace(&admin, TRADING_FEE_BPS, FEE_COLLECTOR_ADDR);
        
        admin
    }

    /// Create test user accounts with APT balances
    fun create_test_users(): (signer, signer, signer, signer) {
        let user1 = account::create_account_for_test(USER1_ADDR);
        let user2 = account::create_account_for_test(USER2_ADDR);
        let user3 = account::create_account_for_test(USER3_ADDR);
        let user4 = account::create_account_for_test(USER4_ADDR);
        
        // Initialize APT for users
        aptos_coin::ensure_initialized_with_apt_fa_metadata_for_test();
        coin::register<AptosCoin>(&user1);
        coin::register<AptosCoin>(&user2);
        coin::register<AptosCoin>(&user3);
        coin::register<AptosCoin>(&user4);
        
        // Mint APT for testing
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&user1);
        coin::deposit(USER1_ADDR, coin::mint(INITIAL_BALANCE, &mint_cap));
        coin::deposit(USER2_ADDR, coin::mint(INITIAL_BALANCE, &mint_cap));
        coin::deposit(USER3_ADDR, coin::mint(INITIAL_BALANCE, &mint_cap));
        coin::deposit(USER4_ADDR, coin::mint(INITIAL_BALANCE, &mint_cap));
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
        
        (user1, user2, user3, user4)
    }

    /// Create a test domain with fractional ownership
    fun create_test_domain(creator: &signer): Object<DomainAsset> {
        let valuation = create_test_valuation();
        let fractional_config = option::some(create_test_fractional_config());
        
        domain_registry::create_domain_object(
            creator,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            valuation,
            fractional_config
        )
    }

    /// Setup a complete test scenario with domain and shares
    fun setup_domain_with_shares(creator: &signer): Object<DomainAsset> {
        let domain_obj = create_test_domain(creator);
        
        // Initialize fractional ownership
        fractional::initialize_fractional_ownership(
            creator,
            domain_obj,
            TOTAL_SUPPLY,
            string::utf8(TEST_TICKER)
        );
        
        domain_obj
    }
 
   // ================================
    // Marketplace Initialization Tests
    // ================================

    #[test]
    fun test_initialize_marketplace_success() {
        let admin = account::create_account_for_test(@orbiter);
        timestamp::set_time_has_started_for_testing(&admin);
        
        // Initialize marketplace
        marketplace::initialize_marketplace(&admin, TRADING_FEE_BPS, FEE_COLLECTOR_ADDR);
        
        // Verify marketplace was initialized correctly
        assert!(marketplace::is_marketplace_initialized(), 1);
        assert!(marketplace::get_marketplace_admin() == @orbiter, 2);
        assert!(!marketplace::is_marketplace_paused(), 3);
        assert!(marketplace::get_trading_fee() == TRADING_FEE_BPS, 4);
        assert!(marketplace::get_fee_collector() == FEE_COLLECTOR_ADDR, 5);
        
        // Verify initial statistics
        let (total_volume, total_trades, total_listings, _) = marketplace::get_marketplace_stats();
        assert!(total_volume == 0, 6);
        assert!(total_trades == 0, 7);
        assert!(total_listings == 0, 8);
    }

    #[test]
    #[expected_failure(abort_code = 25, location = orbiter::marketplace)]
    fun test_initialize_marketplace_already_exists() {
        let admin = setup_test_env();
        
        // Try to initialize again - should fail
        marketplace::initialize_marketplace(&admin, TRADING_FEE_BPS, FEE_COLLECTOR_ADDR);
    }

    #[test]
    fun test_marketplace_pause_unpause() {
        let admin = setup_test_env();
        
        // Initially not paused
        assert!(!marketplace::is_marketplace_paused(), 1);
        
        // Pause marketplace
        marketplace::pause_marketplace(&admin);
        assert!(marketplace::is_marketplace_paused(), 2);
        
        // Unpause marketplace
        marketplace::unpause_marketplace(&admin);
        assert!(!marketplace::is_marketplace_paused(), 3);
    }

    #[test]
    fun test_update_marketplace_settings() {
        let admin = setup_test_env();
        let new_fee_collector = account::create_account_for_test(@0x700);
        let new_fee_collector_addr = signer::address_of(&new_fee_collector);
        
        let new_fee_bps = 500; // 5%
        
        // Update settings
        marketplace::update_marketplace_settings(&admin, new_fee_bps, new_fee_collector_addr);
        
        // Verify updates
        assert!(marketplace::get_trading_fee() == new_fee_bps, 1);
        assert!(marketplace::get_fee_collector() == new_fee_collector_addr, 2);
    }

    // ================================
    // Listing Creation and Management Tests
    // ================================

    #[test]
    fun test_create_listing_success() {
        let admin = setup_test_env();
        let (user1, _user2, _user3, _user4) = create_test_users();
        
        // Create domain with fractional ownership
        let domain_obj = setup_domain_with_shares(&user1);
        
        // Create listing
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Verify listing details
        let (domain_addr, seller, price, shares_available, original_shares, _, _, active, listing_id) = 
            marketplace::get_listing_details(listing_obj);
        
        assert!(domain_addr == object::object_address(&domain_obj), 1);
        assert!(seller == USER1_ADDR, 2);
        assert!(price == PRICE_PER_SHARE, 3);
        assert!(shares_available == SHARES_TO_LIST, 4);
        assert!(original_shares == SHARES_TO_LIST, 5);
        assert!(active, 6);
        assert!(listing_id == 1, 7);
        
        // Verify listing is active
        assert!(marketplace::is_listing_active(listing_obj), 8);
        
        // Verify marketplace statistics updated
        let (_, _, total_listings, _) = marketplace::get_marketplace_stats();
        assert!(total_listings == 1, 9);
        
        // Verify domain has listings
        let domain_listings = marketplace::get_domain_listings(domain_obj);
        assert!(vector::length(&domain_listings) == 1, 10);
        
        // Verify listing can be found by ID
        let found_listing = marketplace::get_listing_by_id(1);
        assert!(object::object_address(&found_listing) == object::object_address(&listing_obj), 11);
    }

    #[test]
    #[expected_failure(abort_code = 26, location = orbiter::marketplace)]
    fun test_create_listing_insufficient_shares() {
        let admin = setup_test_env();
        let (user1, _user2, _user3, _user4) = create_test_users();
        
        // Create domain with fractional ownership
        let domain_obj = setup_domain_with_shares(&user1);
        
        // Try to list more shares than owned - should fail
        marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            TOTAL_SUPPLY + 1
        );
    }

    #[test]
    fun test_cancel_listing_success() {
        let admin = setup_test_env();
        let (user1, _user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Verify listing is active
        assert!(marketplace::is_listing_active(listing_obj), 1);
        
        // Cancel listing
        marketplace::cancel_listing(&user1, listing_obj);
        
        // Verify listing is no longer active
        assert!(!marketplace::is_listing_active(listing_obj), 2);
        
        // Verify domain has no active listings
        let domain_listings = marketplace::get_domain_listings(domain_obj);
        assert!(vector::length(&domain_listings) == 0, 3);
        
        // Verify listing no longer exists by ID
        assert!(!marketplace::listing_exists(1), 4);
    }

    #[test]
    #[expected_failure(abort_code = 28, location = orbiter::marketplace)]
    fun test_cancel_listing_unauthorized() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Try to cancel listing as different user - should fail
        marketplace::cancel_listing(&user2, listing_obj);
    }

    #[test]
    fun test_update_listing_price_success() {
        let admin = setup_test_env();
        let (user1, _user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        let new_price = PRICE_PER_SHARE * 2;
        
        // Update listing price
        marketplace::update_listing_price(&user1, listing_obj, new_price);
        
        // Verify price was updated
        let (_, _, price, _, _, _, _, _, _) = marketplace::get_listing_details(listing_obj);
        assert!(price == new_price, 1);
    }

    #[test]
    #[expected_failure(abort_code = 28, location = orbiter::marketplace)]
    fun test_update_listing_price_unauthorized() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Try to update price as different user - should fail
        marketplace::update_listing_price(&user2, listing_obj, PRICE_PER_SHARE * 2);
    }    
// ================================
    // Trade Execution and Settlement Tests
    // ================================

    #[test]
    fun test_buy_shares_success() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        let fee_collector = account::create_account_for_test(FEE_COLLECTOR_ADDR);
        coin::register<AptosCoin>(&fee_collector);
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Record initial balances
        let buyer_initial_apt = coin::balance<AptosCoin>(USER2_ADDR);
        let seller_initial_apt = coin::balance<AptosCoin>(USER1_ADDR);
        let fee_collector_initial_apt = coin::balance<AptosCoin>(FEE_COLLECTOR_ADDR);
        let buyer_initial_shares = fractional::get_share_balance(domain_obj, USER2_ADDR);
        let seller_initial_shares = fractional::get_share_balance(domain_obj, USER1_ADDR);
        
        // Calculate expected amounts
        let total_cost = PRICE_PER_SHARE * SHARES_TO_BUY;
        let fee_amount = (total_cost * TRADING_FEE_BPS) / 10000;
        let seller_amount = total_cost - fee_amount;
        
        // Buy shares
        marketplace::buy_shares(&user2, listing_obj, SHARES_TO_BUY);
        
        // Verify APT balances changed correctly
        assert!(coin::balance<AptosCoin>(USER2_ADDR) == buyer_initial_apt - total_cost, 1);
        assert!(coin::balance<AptosCoin>(USER1_ADDR) == seller_initial_apt + seller_amount, 2);
        assert!(coin::balance<AptosCoin>(FEE_COLLECTOR_ADDR) == fee_collector_initial_apt + fee_amount, 3);
        
        // Verify share balances changed correctly
        assert!(fractional::get_share_balance(domain_obj, USER2_ADDR) == buyer_initial_shares + SHARES_TO_BUY, 4);
        assert!(fractional::get_share_balance(domain_obj, USER1_ADDR) == seller_initial_shares - SHARES_TO_BUY, 5);
        
        // Verify listing updated
        let (_, _, _, shares_available, _, _, _, active, _) = marketplace::get_listing_details(listing_obj);
        assert!(shares_available == SHARES_TO_LIST - SHARES_TO_BUY, 6);
        assert!(active, 7); // Should still be active since not fully sold
        
        // Verify marketplace statistics
        let (total_volume, total_trades, _, _) = marketplace::get_marketplace_stats();
        assert!(total_volume == total_cost, 8);
        assert!(total_trades == 1, 9);
    }

    #[test]
    fun test_buy_shares_complete_listing() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        let fee_collector = account::create_account_for_test(FEE_COLLECTOR_ADDR);
        coin::register<AptosCoin>(&fee_collector);
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Buy all shares in the listing
        marketplace::buy_shares(&user2, listing_obj, SHARES_TO_LIST);
        
        // Verify listing is now inactive
        assert!(!marketplace::is_listing_active(listing_obj), 1);
        
        // Verify listing has 0 shares available
        let (_, _, _, shares_available, _, _, _, active, _) = marketplace::get_listing_details(listing_obj);
        assert!(shares_available == 0, 2);
        assert!(!active, 3);
        
        // Verify domain has no active listings
        let domain_listings = marketplace::get_domain_listings(domain_obj);
        assert!(vector::length(&domain_listings) == 0, 4);
    }

    #[test]
    #[expected_failure(abort_code = 24, location = orbiter::marketplace)]
    fun test_buy_shares_self_trade() {
        let admin = setup_test_env();
        let (user1, _user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Try to buy own shares - should fail
        marketplace::buy_shares(&user1, listing_obj, SHARES_TO_BUY);
    }

    #[test]
    #[expected_failure(abort_code = 22, location = orbiter::marketplace)]
    fun test_buy_shares_insufficient_payment() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Drain buyer's APT balance
        let buyer_balance = coin::balance<AptosCoin>(USER2_ADDR);
        coin::transfer<AptosCoin>(&user2, USER1_ADDR, buyer_balance);
        
        // Try to buy shares without sufficient APT - should fail
        marketplace::buy_shares(&user2, listing_obj, SHARES_TO_BUY);
    }

    #[test]
    #[expected_failure(abort_code = 26, location = orbiter::marketplace)]
    fun test_buy_shares_insufficient_shares_in_listing() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Try to buy more shares than available in listing - should fail
        marketplace::buy_shares(&user2, listing_obj, SHARES_TO_LIST + 1);
    }

    // ================================
    // Fee Calculation and Payment Processing Tests
    // ================================

    #[test]
    fun test_calculate_trade_cost() {
        let admin = setup_test_env();
        let (user1, _user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Calculate trade cost
        let (total_cost, fee_amount, seller_amount) = marketplace::calculate_trade_cost(
            listing_obj,
            SHARES_TO_BUY
        );
        
        // Verify calculations
        let expected_total = PRICE_PER_SHARE * SHARES_TO_BUY;
        let expected_fee = (expected_total * TRADING_FEE_BPS) / 10000;
        let expected_seller = expected_total - expected_fee;
        
        assert!(total_cost == expected_total, 1);
        assert!(fee_amount == expected_fee, 2);
        assert!(seller_amount == expected_seller, 3);
    }

    #[test]
    fun test_calculate_trade_fees() {
        let admin = setup_test_env();
        
        let test_amount = 1000000; // 0.01 APT
        let (total_amount, fee_amount, seller_amount) = marketplace::calculate_trade_fees(test_amount);
        
        let expected_fee = (test_amount * TRADING_FEE_BPS) / 10000;
        let expected_seller = test_amount - expected_fee;
        
        assert!(total_amount == test_amount, 1);
        assert!(fee_amount == expected_fee, 2);
        assert!(seller_amount == expected_seller, 3);
    }

    #[test]
    fun test_fee_distribution_multiple_trades() {
        let admin = setup_test_env();
        let (user1, user2, user3, _user4) = create_test_users();
        let fee_collector = account::create_account_for_test(FEE_COLLECTOR_ADDR);
        coin::register<AptosCoin>(&fee_collector);
        
        // Create domain and multiple listings
        let domain_obj = setup_domain_with_shares(&user1);
        
        // Transfer some shares to user3 so they can create listings too
        fractional::transfer_shares(&user1, domain_obj, USER3_ADDR, SHARES_TO_LIST);
        
        let listing1 = marketplace::create_listing(&user1, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
        let listing2 = marketplace::create_listing(&user3, domain_obj, PRICE_PER_SHARE * 2, SHARES_TO_LIST);
        
        let initial_fee_balance = coin::balance<AptosCoin>(FEE_COLLECTOR_ADDR);
        
        // Execute multiple trades
        marketplace::buy_shares(&user2, listing1, SHARES_TO_BUY);
        marketplace::buy_shares(&user2, listing2, SHARES_TO_BUY);
        
        // Calculate expected total fees
        let trade1_cost = PRICE_PER_SHARE * SHARES_TO_BUY;
        let trade2_cost = (PRICE_PER_SHARE * 2) * SHARES_TO_BUY;
        let total_cost = trade1_cost + trade2_cost;
        let expected_total_fees = (total_cost * TRADING_FEE_BPS) / 10000;
        
        // Verify fee collector received correct total fees
        let final_fee_balance = coin::balance<AptosCoin>(FEE_COLLECTOR_ADDR);
        assert!(final_fee_balance == initial_fee_balance + expected_total_fees, 1);
    } 
   // ================================
    // Marketplace Statistics and Query Functions Tests
    // ================================

    #[test]
    fun test_marketplace_statistics() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        let fee_collector = account::create_account_for_test(FEE_COLLECTOR_ADDR);
        coin::register<AptosCoin>(&fee_collector);
        
        // Initially empty marketplace
        let (volume, trades, listings, _) = marketplace::get_marketplace_stats();
        assert!(volume == 0, 1);
        assert!(trades == 0, 2);
        assert!(listings == 0, 3);
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Verify listing count increased
        let (_, _, listings_after_create, _) = marketplace::get_marketplace_stats();
        assert!(listings_after_create == 1, 4);
        
        // Execute trade
        marketplace::buy_shares(&user2, listing_obj, SHARES_TO_BUY);
        
        // Verify statistics updated
        let (volume_after_trade, trades_after_trade, _, _) = marketplace::get_marketplace_stats();
        let expected_volume = PRICE_PER_SHARE * SHARES_TO_BUY;
        assert!(volume_after_trade == expected_volume, 5);
        assert!(trades_after_trade == 1, 6);
        
        // Test individual getters
        assert!(marketplace::get_total_volume() == expected_volume, 7);
        assert!(marketplace::get_total_trades() == 1, 8);
        assert!(marketplace::get_total_listings() == 1, 9);
    }

    #[test]
    fun test_domain_market_data() {
        let admin = setup_test_env();
        let (user1, _user2, user3, user4) = create_test_users();
        
        // Create domain and multiple listings with different prices
        let domain_obj = setup_domain_with_shares(&user1);
        
        // Transfer shares to create multiple listings
        fractional::transfer_shares(&user1, domain_obj, USER3_ADDR, SHARES_TO_LIST);
        fractional::transfer_shares(&user1, domain_obj, USER4_ADDR, SHARES_TO_LIST);
        
        let price1 = PRICE_PER_SHARE;
        let price2 = PRICE_PER_SHARE * 2;
        let price3 = PRICE_PER_SHARE * 3;
        
        marketplace::create_listing(&user1, domain_obj, price1, SHARES_TO_LIST);
        marketplace::create_listing(&user3, domain_obj, price2, SHARES_TO_LIST);
        marketplace::create_listing(&user4, domain_obj, price3, SHARES_TO_LIST);
        
        // Get market data
        let (total_listings, total_shares_listed, lowest_price, highest_price, average_price, market_cap) = 
            marketplace::get_domain_market_data(domain_obj);
        
        assert!(total_listings == 3, 1);
        assert!(total_shares_listed == SHARES_TO_LIST * 3, 2);
        assert!(lowest_price == price1, 3);
        assert!(highest_price == price3, 4);
        
        // Verify average price calculation
        let expected_total_value = (price1 + price2 + price3) * SHARES_TO_LIST;
        let expected_average = expected_total_value / (SHARES_TO_LIST * 3);
        assert!(average_price == expected_average, 5);
        
        // Market cap should be based on lowest price
        let expected_market_cap = price1 * TOTAL_SUPPLY;
        assert!(market_cap == expected_market_cap, 6);
    }

    #[test]
    fun test_get_best_ask_price() {
        let admin = setup_test_env();
        let (user1, _user2, user3, user4) = create_test_users();
        
        // Create domain
        let domain_obj = setup_domain_with_shares(&user1);
        
        // Initially no listings, should return 0
        assert!(marketplace::get_best_ask_price(domain_obj) == 0, 1);
        
        // Transfer shares and create listings with different prices
        fractional::transfer_shares(&user1, domain_obj, USER3_ADDR, SHARES_TO_LIST);
        fractional::transfer_shares(&user1, domain_obj, USER4_ADDR, SHARES_TO_LIST);
        
        let high_price = PRICE_PER_SHARE * 3;
        let medium_price = PRICE_PER_SHARE * 2;
        let low_price = PRICE_PER_SHARE;
        
        marketplace::create_listing(&user1, domain_obj, high_price, SHARES_TO_LIST);
        marketplace::create_listing(&user3, domain_obj, medium_price, SHARES_TO_LIST);
        marketplace::create_listing(&user4, domain_obj, low_price, SHARES_TO_LIST);
        
        // Best ask should be the lowest price
        assert!(marketplace::get_best_ask_price(domain_obj) == low_price, 2);
    }

    #[test]
    fun test_get_liquidity_at_price() {
        let admin = setup_test_env();
        let (user1, _user2, user3, user4) = create_test_users();
        
        // Create domain and transfer shares
        let domain_obj = setup_domain_with_shares(&user1);
        fractional::transfer_shares(&user1, domain_obj, USER3_ADDR, SHARES_TO_LIST);
        fractional::transfer_shares(&user1, domain_obj, USER4_ADDR, SHARES_TO_LIST);
        
        let target_price = PRICE_PER_SHARE;
        let different_price = PRICE_PER_SHARE * 2;
        
        // Create multiple listings at the same price
        marketplace::create_listing(&user1, domain_obj, target_price, SHARES_TO_LIST);
        marketplace::create_listing(&user3, domain_obj, target_price, SHARES_TO_LIST / 2);
        marketplace::create_listing(&user4, domain_obj, different_price, SHARES_TO_LIST);
        
        // Check liquidity at target price
        let liquidity = marketplace::get_liquidity_at_price(domain_obj, target_price);
        assert!(liquidity == SHARES_TO_LIST + (SHARES_TO_LIST / 2), 1);
        
        // Check liquidity at different price
        let liquidity_different = marketplace::get_liquidity_at_price(domain_obj, different_price);
        assert!(liquidity_different == SHARES_TO_LIST, 2);
        
        // Check liquidity at non-existent price
        let liquidity_none = marketplace::get_liquidity_at_price(domain_obj, PRICE_PER_SHARE * 10);
        assert!(liquidity_none == 0, 3);
    }

    #[test]
    fun test_domain_listing_count() {
        let admin = setup_test_env();
        let (user1, _user2, user3, _user4) = create_test_users();
        
        // Create domain
        let domain_obj = setup_domain_with_shares(&user1);
        
        // Initially no listings
        assert!(marketplace::get_domain_listing_count(domain_obj) == 0, 1);
        
        // Create first listing
        marketplace::create_listing(&user1, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
        assert!(marketplace::get_domain_listing_count(domain_obj) == 1, 2);
        
        // Transfer shares and create second listing
        fractional::transfer_shares(&user1, domain_obj, USER3_ADDR, SHARES_TO_LIST);
        marketplace::create_listing(&user3, domain_obj, PRICE_PER_SHARE * 2, SHARES_TO_LIST);
        assert!(marketplace::get_domain_listing_count(domain_obj) == 2, 3);
    }

    // ================================
    // Error Handling and Edge Cases Tests
    // ================================

    #[test]
    #[expected_failure(abort_code = 30, location = orbiter::marketplace)]
    fun test_trading_when_paused() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Pause marketplace
        marketplace::pause_marketplace(&admin);
        
        // Try to buy shares while paused - should fail
        marketplace::buy_shares(&user2, listing_obj, SHARES_TO_BUY);
    }

    #[test]
    #[expected_failure(abort_code = 21, location = orbiter::marketplace)]
    fun test_buy_from_inactive_listing() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        
        // Create domain and listing
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(
            &user1,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Cancel the listing
        marketplace::cancel_listing(&user1, listing_obj);
        
        // Try to buy from cancelled listing - should fail
        marketplace::buy_shares(&user2, listing_obj, SHARES_TO_BUY);
    }

    #[test]
    fun test_multiple_domains_independence() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        
        // Create two different domains
        let domain1 = setup_domain_with_shares(&user1);
        
        // Create second domain
        let valuation2 = create_test_valuation();
        let fractional_config2 = option::some(domain_registry::new_fractional_config(
            string::utf8(TEST_TICKER_2),
            TOTAL_SUPPLY,
            true
        ));
        
        let domain2 = domain_registry::create_domain_object(
            &user1,
            string::utf8(TEST_DOMAIN_NAME_2),
            string::utf8(TEST_VERIFICATION_HASH),
            valuation2,
            fractional_config2
        );
        
        fractional::initialize_fractional_ownership(&user1, domain2, TOTAL_SUPPLY, string::utf8(TEST_TICKER_2));
        
        // Create listings for both domains
        let listing1 = marketplace::create_listing(&user1, domain1, PRICE_PER_SHARE, SHARES_TO_LIST);
        let listing2 = marketplace::create_listing(&user1, domain2, PRICE_PER_SHARE * 2, SHARES_TO_LIST);
        
        // Verify each domain has its own listings
        let domain1_listings = marketplace::get_domain_listings(domain1);
        let domain2_listings = marketplace::get_domain_listings(domain2);
        
        assert!(vector::length(&domain1_listings) == 1, 1);
        assert!(vector::length(&domain2_listings) == 1, 2);
        
        // Verify listings are different
        let listing1_from_domain = *vector::borrow(&domain1_listings, 0);
        let listing2_from_domain = *vector::borrow(&domain2_listings, 0);
        
        assert!(object::object_address(&listing1_from_domain) == object::object_address(&listing1), 3);
        assert!(object::object_address(&listing2_from_domain) == object::object_address(&listing2), 4);
        assert!(object::object_address(&listing1) != object::object_address(&listing2), 5);
    }

    #[test]
    fun test_marketplace_health_metrics() {
        let admin = setup_test_env();
        let (user1, user2, _user3, _user4) = create_test_users();
        let fee_collector = account::create_account_for_test(FEE_COLLECTOR_ADDR);
        coin::register<AptosCoin>(&fee_collector);
        
        // Initially unhealthy (no trades)
        let (total_listings, domains_with_listings, avg_listings, is_healthy) = 
            marketplace::get_marketplace_health_metrics();
        assert!(!is_healthy, 1);
        
        // Create domain and execute trade
        let domain_obj = setup_domain_with_shares(&user1);
        let listing_obj = marketplace::create_listing(&user1, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
        marketplace::buy_shares(&user2, listing_obj, SHARES_TO_BUY);
        
        // Should now be healthy
        let (_, _, _, is_healthy_after) = marketplace::get_marketplace_health_metrics();
        assert!(is_healthy_after, 2);
    }

    // ================================
    // Integration Tests
    // ================================

    #[test]
    fun test_complete_trading_workflow() {
        let admin = setup_test_env();
        let (user1, user2, user3, _user4) = create_test_users();
        let fee_collector = account::create_account_for_test(FEE_COLLECTOR_ADDR);
        coin::register<AptosCoin>(&fee_collector);
        
        // 1. Create domain with fractional ownership
        let domain_obj = setup_domain_with_shares(&user1);
        
        // 2. Create initial listing
        let listing_obj = marketplace::create_listing(&user1, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
        
        // 3. User2 buys some shares
        marketplace::buy_shares(&user2, listing_obj, SHARES_TO_BUY);
        
        // 4. User2 creates their own listing
        let user2_listing = marketplace::create_listing(&user2, domain_obj, PRICE_PER_SHARE * 2, SHARES_TO_BUY / 2);
        
        // 5. User3 buys from user2's listing
        marketplace::buy_shares(&user3, user2_listing, SHARES_TO_BUY / 4);
        
        // 6. Verify final state
        let user1_shares = fractional::get_share_balance(domain_obj, USER1_ADDR);
        let user2_shares = fractional::get_share_balance(domain_obj, USER2_ADDR);
        let user3_shares = fractional::get_share_balance(domain_obj, USER3_ADDR);
        
        // User1: Started with TOTAL_SUPPLY, sold SHARES_TO_BUY
        assert!(user1_shares == TOTAL_SUPPLY - SHARES_TO_BUY, 1);
        
        // User2: Bought SHARES_TO_BUY, sold SHARES_TO_BUY / 4
        assert!(user2_shares == SHARES_TO_BUY - (SHARES_TO_BUY / 4), 2);
        
        // User3: Bought SHARES_TO_BUY / 4
        assert!(user3_shares == SHARES_TO_BUY / 4, 3);
        
        // Verify total supply is preserved
        let total_shares = user1_shares + user2_shares + user3_shares;
        assert!(total_shares == TOTAL_SUPPLY, 4);
        
        // Verify marketplace statistics
        let (total_volume, total_trades, _, _) = marketplace::get_marketplace_stats();
        assert!(total_trades == 2, 5);
        
        let expected_volume = (PRICE_PER_SHARE * SHARES_TO_BUY) + ((PRICE_PER_SHARE * 2) * (SHARES_TO_BUY / 4));
        assert!(total_volume == expected_volume, 6);
    }
}