/// Comprehensive integration tests for cross-module functionality
/// 
/// This test suite covers:
/// 1. Complete domain tokenization to trading workflow
/// 2. Event emission across all modules
/// 3. Error propagation and handling between modules
/// 4. Data consistency across module boundaries
/// 5. Complex multi-module scenarios
/// 6. End-to-end user workflows
/// 7. Cross-module state synchronization
/// 8. Integration with valuation oracle system
#[test_only]
module orbiter::integration_tests {
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
    use orbiter::valuation;

    // ================================
    // Test Constants
    // ================================
    
    const TEST_DOMAIN_NAME: vector<u8> = b"example.com";
    const TEST_DOMAIN_NAME_2: vector<u8> = b"test.org";
    const TEST_DOMAIN_NAME_3: vector<u8> = b"crypto.io";
    const TEST_VERIFICATION_HASH: vector<u8> = b"abcdef1234567890abcdef1234567890abcdef12";
    const TEST_TICKER: vector<u8> = b"EXMPL";
    const TEST_TICKER_2: vector<u8> = b"TEST";
    const TEST_TICKER_3: vector<u8> = b"CRYPTO";
    
    // Test addresses
    const DOMAIN_OWNER_ADDR: address = @0x200;
    const INVESTOR1_ADDR: address = @0x300;
    const INVESTOR2_ADDR: address = @0x400;
    const INVESTOR3_ADDR: address = @0x500;
    const ORACLE1_ADDR: address = @0x600;
    const ORACLE2_ADDR: address = @0x700;
    const ORACLE3_ADDR: address = @0x800;
    const FEE_COLLECTOR_ADDR: address = @0x900;

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

    /// Create an updated valuation with higher scores
    fun create_updated_valuation(): ValuationData {
        domain_registry::new_valuation_data(
            850,        // increased score
            2000000,    // increased market_value
            90,         // increased seo_authority
            85,         // increased traffic_estimate
            95,         // increased brandability
            85,         // increased tld_rarity
            timestamp::now_seconds()
        )
    }

    /// Create a test fractional config
    fun create_test_fractional_config(ticker: vector<u8>): FractionalConfig {
        domain_registry::new_fractional_config(
            string::utf8(ticker),
            TOTAL_SUPPLY,
            true        // trading_enabled
        )
    }

    /// Setup complete test environment with all modules initialized
    fun setup_complete_test_env(): signer {
        let admin = account::create_account_for_test(@orbiter);
        timestamp::set_time_has_started_for_testing(&admin);
        
        // Initialize all modules
        domain_registry::initialize(&admin);
        marketplace::initialize_marketplace(&admin, TRADING_FEE_BPS, FEE_COLLECTOR_ADDR);
        
        // Initialize valuation oracle with test oracles
        let initial_oracles = vector::empty<address>();
        vector::push_back(&mut initial_oracles, ORACLE1_ADDR);
        vector::push_back(&mut initial_oracles, ORACLE2_ADDR);
        vector::push_back(&mut initial_oracles, ORACLE3_ADDR);
        
        valuation::initialize_valuation_oracle(&admin, initial_oracles, 2); // Require 2 out of 3 consensus
        
        admin
    }   
 /// Create all test user accounts with APT balances
    fun create_all_test_users(): (signer, signer, signer, signer, signer, signer, signer, signer) {
        let domain_owner = account::create_account_for_test(DOMAIN_OWNER_ADDR);
        let investor1 = account::create_account_for_test(INVESTOR1_ADDR);
        let investor2 = account::create_account_for_test(INVESTOR2_ADDR);
        let investor3 = account::create_account_for_test(INVESTOR3_ADDR);
        let oracle1 = account::create_account_for_test(ORACLE1_ADDR);
        let oracle2 = account::create_account_for_test(ORACLE2_ADDR);
        let oracle3 = account::create_account_for_test(ORACLE3_ADDR);
        let fee_collector = account::create_account_for_test(FEE_COLLECTOR_ADDR);
        
        // Initialize APT for all users
        aptos_coin::ensure_initialized_with_apt_fa_metadata_for_test();
        coin::register<AptosCoin>(&domain_owner);
        coin::register<AptosCoin>(&investor1);
        coin::register<AptosCoin>(&investor2);
        coin::register<AptosCoin>(&investor3);
        coin::register<AptosCoin>(&fee_collector);
        
        // Mint APT for testing
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(&domain_owner);
        coin::deposit(DOMAIN_OWNER_ADDR, coin::mint(INITIAL_BALANCE, &mint_cap));
        coin::deposit(INVESTOR1_ADDR, coin::mint(INITIAL_BALANCE, &mint_cap));
        coin::deposit(INVESTOR2_ADDR, coin::mint(INITIAL_BALANCE, &mint_cap));
        coin::deposit(INVESTOR3_ADDR, coin::mint(INITIAL_BALANCE, &mint_cap));
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
        
        (domain_owner, investor1, investor2, investor3, oracle1, oracle2, oracle3, fee_collector)
    }

    // ================================
    // Complete Domain Tokenization to Trading Workflow Tests
    // ================================

    #[test]
    fun test_complete_domain_tokenization_to_trading_workflow() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, investor2, _investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Step 1: Create domain with fractional ownership
        let domain_name = string::utf8(TEST_DOMAIN_NAME);
        let verification_hash = string::utf8(TEST_VERIFICATION_HASH);
        let valuation = create_test_valuation();
        let fractional_config = option::some(create_test_fractional_config(TEST_TICKER));
        
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            domain_name,
            verification_hash,
            valuation,
            fractional_config
        );
        
        // Verify domain creation
        assert!(domain_registry::domain_exists(domain_name), 1);
        assert!(domain_registry::is_domain_owner(domain_obj, DOMAIN_OWNER_ADDR), 2);
        
        // Step 2: Initialize fractional ownership
        fractional::initialize_fractional_ownership(
            &domain_owner,
            domain_obj,
            TOTAL_SUPPLY,
            string::utf8(TEST_TICKER)
        );
        
        // Verify fractional ownership initialization
        assert!(fractional::is_share_ownership_initialized(domain_obj), 3);
        assert!(fractional::get_share_balance(domain_obj, DOMAIN_OWNER_ADDR) == TOTAL_SUPPLY, 4);
        assert!(fractional::get_total_supply(domain_obj) == TOTAL_SUPPLY, 5);
        
        // Step 3: Create marketplace listing
        let listing_obj = marketplace::create_listing(
            &domain_owner,
            domain_obj,
            PRICE_PER_SHARE,
            SHARES_TO_LIST
        );
        
        // Verify listing creation
        assert!(marketplace::is_listing_active(listing_obj), 6);
        let domain_listings = marketplace::get_domain_listings(domain_obj);
        assert!(vector::length(&domain_listings) == 1, 7);  
      
        // Step 4: Execute trade
        let initial_investor1_shares = fractional::get_share_balance(domain_obj, INVESTOR1_ADDR);
        let initial_owner_shares = fractional::get_share_balance(domain_obj, DOMAIN_OWNER_ADDR);
        let initial_investor1_apt = coin::balance<AptosCoin>(INVESTOR1_ADDR);
        let initial_owner_apt = coin::balance<AptosCoin>(DOMAIN_OWNER_ADDR);
        
        marketplace::buy_shares(&investor1, listing_obj, SHARES_TO_BUY);
        
        // Verify trade execution
        assert!(fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) == initial_investor1_shares + SHARES_TO_BUY, 8);
        assert!(fractional::get_share_balance(domain_obj, DOMAIN_OWNER_ADDR) == initial_owner_shares - SHARES_TO_BUY, 9);
        
        // Verify APT transfers
        let total_cost = PRICE_PER_SHARE * SHARES_TO_BUY;
        let fee_amount = (total_cost * TRADING_FEE_BPS) / 10000;
        let seller_amount = total_cost - fee_amount;
        
        assert!(coin::balance<AptosCoin>(INVESTOR1_ADDR) == initial_investor1_apt - total_cost, 10);
        assert!(coin::balance<AptosCoin>(DOMAIN_OWNER_ADDR) == initial_owner_apt + seller_amount, 11);
        assert!(coin::balance<AptosCoin>(FEE_COLLECTOR_ADDR) == fee_amount, 12);
        
        // Step 5: Verify marketplace statistics
        let (total_volume, total_trades, total_listings, _) = marketplace::get_marketplace_stats();
        assert!(total_volume == total_cost, 13);
        assert!(total_trades == 1, 14);
        assert!(total_listings == 1, 15);
        
        // Step 6: Create secondary market trade (investor1 sells to investor2)
        let secondary_listing = marketplace::create_listing(
            &investor1,
            domain_obj,
            PRICE_PER_SHARE * 2, // Higher price
            SHARES_TO_BUY / 2    // Sell half
        );
        
        marketplace::buy_shares(&investor2, secondary_listing, SHARES_TO_BUY / 2);
        
        // Verify secondary trade
        assert!(fractional::get_share_balance(domain_obj, INVESTOR2_ADDR) == SHARES_TO_BUY / 2, 16);
        assert!(fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) == SHARES_TO_BUY - (SHARES_TO_BUY / 2), 17);
        
        // Verify total supply remains constant throughout all operations
        assert!(fractional::get_total_supply(domain_obj) == TOTAL_SUPPLY, 18);
        
        // Verify all shares are accounted for
        let total_distributed = fractional::get_share_balance(domain_obj, DOMAIN_OWNER_ADDR) +
                               fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) +
                               fractional::get_share_balance(domain_obj, INVESTOR2_ADDR);
        assert!(total_distributed == TOTAL_SUPPLY, 19);
    } 
   #[test]
    fun test_multi_domain_trading_workflow() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, investor2, investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Create multiple domains
        let domain1_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER))
        );
        
        let domain2_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME_2),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER_2))
        );
        
        // Initialize fractional ownership for both domains
        fractional::initialize_fractional_ownership(&domain_owner, domain1_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER));
        fractional::initialize_fractional_ownership(&domain_owner, domain2_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER_2));
        
        // Create listings for both domains at different prices
        let listing1 = marketplace::create_listing(&domain_owner, domain1_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
        let listing2 = marketplace::create_listing(&domain_owner, domain2_obj, PRICE_PER_SHARE * 2, SHARES_TO_LIST);
        
        // Execute trades on both domains
        marketplace::buy_shares(&investor1, listing1, SHARES_TO_BUY);
        marketplace::buy_shares(&investor2, listing2, SHARES_TO_BUY);
        
        // Verify independent domain state
        assert!(fractional::get_share_balance(domain1_obj, INVESTOR1_ADDR) == SHARES_TO_BUY, 1);
        assert!(fractional::get_share_balance(domain1_obj, INVESTOR2_ADDR) == 0, 2);
        assert!(fractional::get_share_balance(domain2_obj, INVESTOR1_ADDR) == 0, 3);
        assert!(fractional::get_share_balance(domain2_obj, INVESTOR2_ADDR) == SHARES_TO_BUY, 4);
        
        // Verify marketplace statistics account for both trades
        let (total_volume, total_trades, _, _) = marketplace::get_marketplace_stats();
        let expected_volume = (PRICE_PER_SHARE * SHARES_TO_BUY) + (PRICE_PER_SHARE * 2 * SHARES_TO_BUY);
        assert!(total_volume == expected_volume, 5);
        assert!(total_trades == 2, 6);
        
        // Test cross-domain portfolio for investor3
        marketplace::buy_shares(&investor3, listing1, SHARES_TO_BUY / 2);
        marketplace::buy_shares(&investor3, listing2, SHARES_TO_BUY / 2);
        
        // Verify investor3 has shares in both domains
        assert!(fractional::get_share_balance(domain1_obj, INVESTOR3_ADDR) == SHARES_TO_BUY / 2, 7);
        assert!(fractional::get_share_balance(domain2_obj, INVESTOR3_ADDR) == SHARES_TO_BUY / 2, 8);
    }    
// ================================
    // Event Emission Across All Modules Tests
    // ================================

    #[test]
    fun test_event_emission_across_modules() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, _investor2, _investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Create domain - should emit DomainTokenized event
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER))
        );
        
        // Initialize fractional ownership - should emit ShareOwnershipInitialized event
        fractional::initialize_fractional_ownership(&domain_owner, domain_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER));
        
        // Transfer shares - should emit ShareTransferEvent
        fractional::transfer_shares(&domain_owner, domain_obj, INVESTOR1_ADDR, SHARES_TO_BUY);
        
        // Verify share transfer event count increased
        let (_, event_count, _) = fractional::get_share_info(domain_obj);
        assert!(event_count == 1, 1);
        
        // Create listing - should emit ListingCreated event
        let listing_obj = marketplace::create_listing(&domain_owner, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
        
        // Execute trade - should emit TradeExecuted event and ShareTransferEvent
        let initial_event_count = event_count;
        marketplace::buy_shares(&investor1, listing_obj, SHARES_TO_BUY);
        
        // Verify additional share transfer event from trade
        let (_, final_event_count, _) = fractional::get_share_info(domain_obj);
        assert!(final_event_count == initial_event_count + 1, 2);
        
        // Cancel listing - should emit ListingCancelled event
        marketplace::cancel_listing(&domain_owner, listing_obj);
        
        // Update valuation - should emit ValuationUpdated event
        let updated_valuation = create_updated_valuation();
        domain_registry::update_domain_valuation(&admin, domain_obj, updated_valuation);
        
        // Verify valuation was updated
        let stored_valuation = domain_registry::get_domain_valuation(domain_obj);
        assert!(domain_registry::get_valuation_score(&stored_valuation) == 850, 3);
    }    //
 ================================
    // Error Propagation and Handling Between Modules Tests
    // ================================

    #[test]
    #[expected_failure(abort_code = 13, location = orbiter::fractional)]
    fun test_fractional_operations_without_fractional_config() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, _investor2, _investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Create domain WITHOUT fractional config
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::none() // No fractional config
        );
        
        // Try to initialize fractional ownership - should fail
        fractional::initialize_fractional_ownership(&domain_owner, domain_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER));
    }

    #[test]
    #[expected_failure(abort_code = 26, location = orbiter::marketplace)]
    fun test_marketplace_listing_without_sufficient_shares() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, _investor2, _investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Create domain and initialize fractional ownership
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER))
        );
        
        fractional::initialize_fractional_ownership(&domain_owner, domain_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER));
        
        // Transfer all shares away
        fractional::transfer_shares(&domain_owner, domain_obj, INVESTOR1_ADDR, TOTAL_SUPPLY);
        
        // Try to create listing without shares - should fail
        marketplace::create_listing(&domain_owner, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
    }

    #[test]
    #[expected_failure(abort_code = 14, location = orbiter::fractional)]
    fun test_marketplace_operations_without_fractional_initialization() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, _investor2, _investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Create domain with fractional config but don't initialize fractional ownership
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER))
        );
        
        // Try to create listing without initializing fractional ownership - should fail
        marketplace::create_listing(&domain_owner, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
    }    //
 ================================
    // Data Consistency Across Module Boundaries Tests
    // ================================

    #[test]
    fun test_data_consistency_across_modules() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, investor2, investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER))
        );
        
        fractional::initialize_fractional_ownership(&domain_owner, domain_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER));
        
        // Verify consistency between domain registry and fractional module
        let fractional_config = domain_registry::get_fractional_config(domain_obj);
        assert!(option::is_some(&fractional_config), 1);
        
        let config = option::borrow(&fractional_config);
        let ticker_from_registry = domain_registry::get_fractional_ticker(config);
        let total_supply_from_registry = domain_registry::get_fractional_total_supply_config(config);
        
        assert!(ticker_from_registry == string::utf8(TEST_TICKER), 2);
        assert!(total_supply_from_registry == TOTAL_SUPPLY, 3);
        assert!(fractional::get_total_supply(domain_obj) == TOTAL_SUPPLY, 4);
        
        // Perform complex operations and verify consistency
        let shares_to_distribute = TOTAL_SUPPLY / 4;
        
        // Distribute shares to multiple investors
        fractional::transfer_shares(&domain_owner, domain_obj, INVESTOR1_ADDR, shares_to_distribute);
        fractional::transfer_shares(&domain_owner, domain_obj, INVESTOR2_ADDR, shares_to_distribute);
        fractional::transfer_shares(&domain_owner, domain_obj, INVESTOR3_ADDR, shares_to_distribute);
        
        // Verify total supply consistency
        let total_distributed = fractional::get_share_balance(domain_obj, DOMAIN_OWNER_ADDR) +
                               fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) +
                               fractional::get_share_balance(domain_obj, INVESTOR2_ADDR) +
                               fractional::get_share_balance(domain_obj, INVESTOR3_ADDR);
        
        assert!(total_distributed == TOTAL_SUPPLY, 5);
        assert!(fractional::get_total_supply(domain_obj) == TOTAL_SUPPLY, 6);
        
        // Create multiple listings and verify marketplace consistency
        let listing1 = marketplace::create_listing(&investor1, domain_obj, PRICE_PER_SHARE, shares_to_distribute / 2);
        let listing2 = marketplace::create_listing(&investor2, domain_obj, PRICE_PER_SHARE * 2, shares_to_distribute / 2);
        
        // Verify marketplace sees correct domain data
        let domain_listings = marketplace::get_domain_listings(domain_obj);
        assert!(vector::length(&domain_listings) == 2, 7);
        
        let (total_listings, total_shares_listed, _, _, _, _) = marketplace::get_domain_market_data(domain_obj);
        assert!(total_listings == 2, 8);
        assert!(total_shares_listed == shares_to_distribute, 9); // Half from each investor
        
        // Execute trades and verify consistency
        marketplace::buy_shares(&investor3, listing1, shares_to_distribute / 4);
        
        // Verify all modules reflect the trade
        let investor3_balance_after_trade = fractional::get_share_balance(domain_obj, INVESTOR3_ADDR);
        assert!(investor3_balance_after_trade == shares_to_distribute + (shares_to_distribute / 4), 10);
        
        // Verify marketplace statistics are consistent
        let (total_volume, total_trades, _, _) = marketplace::get_marketplace_stats();
        let expected_volume = PRICE_PER_SHARE * (shares_to_distribute / 4);
        assert!(total_volume == expected_volume, 11);
        assert!(total_trades == 1, 12);
    } 
   #[test]
    fun test_cross_module_state_synchronization() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, _investor2, _investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER))
        );
        
        fractional::initialize_fractional_ownership(&domain_owner, domain_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER));
        
        // Test domain ownership transfer affects all modules
        let initial_owner = domain_registry::get_domain_owner(domain_obj);
        assert!(initial_owner == DOMAIN_OWNER_ADDR, 1);
        
        // Transfer domain ownership
        domain_registry::transfer_domain(&domain_owner, domain_obj, INVESTOR1_ADDR);
        
        // Verify ownership change is reflected
        let new_owner = domain_registry::get_domain_owner(domain_obj);
        assert!(new_owner == INVESTOR1_ADDR, 2);
        
        // Verify fractional shares are still intact (ownership transfer doesn't affect shares)
        assert!(fractional::get_share_balance(domain_obj, DOMAIN_OWNER_ADDR) == TOTAL_SUPPLY, 3);
        assert!(fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) == 0, 4);
        
        // Test that original owner can still manage their shares
        fractional::transfer_shares(&domain_owner, domain_obj, INVESTOR1_ADDR, SHARES_TO_BUY);
        assert!(fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) == SHARES_TO_BUY, 5);
        
        // Test marketplace operations work with new domain owner
        let listing_obj = marketplace::create_listing(&domain_owner, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
        assert!(marketplace::is_listing_active(listing_obj), 6);
        
        // Verify domain information consistency across all queries
        let (domain_name, original_owner, stored_valuation) = domain_registry::get_domain_info(domain_obj);
        assert!(domain_name == string::utf8(TEST_DOMAIN_NAME), 7);
        assert!(original_owner == DOMAIN_OWNER_ADDR, 8); // Original owner should remain unchanged
        assert!(domain_registry::get_valuation_score(&stored_valuation) == 750, 9);
    }    // 
================================
    // Integration with Valuation Oracle System Tests
    // ================================

    #[test]
    fun test_valuation_oracle_integration() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, _investor2, _investor3, oracle1, oracle2, oracle3, _fee_collector) = create_all_test_users();
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER))
        );
        
        fractional::initialize_fractional_ownership(&domain_owner, domain_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER));
        
        // Create initial listing
        let listing_obj = marketplace::create_listing(&domain_owner, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
        
        // Get initial valuation
        let initial_valuation = domain_registry::get_domain_valuation(domain_obj);
        let initial_market_value = domain_registry::get_valuation_market_value(&initial_valuation);
        assert!(initial_market_value == 1000000, 1);
        
        // Submit valuation updates from oracles
        let updated_valuation = create_updated_valuation();
        
        // Oracle 1 submits update
        valuation::submit_valuation_update(&oracle1, domain_obj, updated_valuation);
        
        // Oracle 2 submits the same update (reaching consensus)
        valuation::submit_valuation_update(&oracle2, domain_obj, updated_valuation);
        
        // Verify valuation was updated after consensus
        let final_valuation = domain_registry::get_domain_valuation(domain_obj);
        let final_market_value = domain_registry::get_valuation_market_value(&final_valuation);
        assert!(final_market_value == 2000000, 2); // Updated value
        
        // Verify marketplace reflects updated valuation in market data
        let (_, _, _, _, _, market_cap) = marketplace::get_domain_market_data(domain_obj);
        // Market cap should be based on current listing price, not valuation
        let expected_market_cap = PRICE_PER_SHARE * TOTAL_SUPPLY;
        assert!(market_cap == expected_market_cap, 3);
        
        // Test that trading continues normally after valuation update
        marketplace::buy_shares(&investor1, listing_obj, SHARES_TO_BUY);
        assert!(fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) == SHARES_TO_BUY, 4);
    }    // ====
============================
    // Complex Multi-Module Scenarios Tests
    // ================================

    #[test]
    fun test_complex_trading_scenario_with_multiple_participants() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, investor2, investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Create domain
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER))
        );
        
        fractional::initialize_fractional_ownership(&domain_owner, domain_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER));
        
        // Phase 1: Initial distribution
        let initial_distribution = TOTAL_SUPPLY / 4;
        fractional::transfer_shares(&domain_owner, domain_obj, INVESTOR1_ADDR, initial_distribution);
        fractional::transfer_shares(&domain_owner, domain_obj, INVESTOR2_ADDR, initial_distribution);
        fractional::transfer_shares(&domain_owner, domain_obj, INVESTOR3_ADDR, initial_distribution);
        
        // Phase 2: Multiple concurrent listings at different prices
        let listing1 = marketplace::create_listing(&domain_owner, domain_obj, PRICE_PER_SHARE, initial_distribution / 2);
        let listing2 = marketplace::create_listing(&investor1, domain_obj, PRICE_PER_SHARE * 2, initial_distribution / 2);
        let listing3 = marketplace::create_listing(&investor2, domain_obj, PRICE_PER_SHARE * 3, initial_distribution / 2);
        
        // Verify market depth
        let (total_listings, total_shares_listed, lowest_price, highest_price, _, _) = 
            marketplace::get_domain_market_data(domain_obj);
        assert!(total_listings == 3, 1);
        assert!(total_shares_listed == (initial_distribution / 2) * 3, 2);
        assert!(lowest_price == PRICE_PER_SHARE, 3);
        assert!(highest_price == PRICE_PER_SHARE * 3, 4);
        
        // Phase 3: Complex trading sequence
        // Investor3 buys from cheapest listing first
        marketplace::buy_shares(&investor3, listing1, initial_distribution / 4);
        
        // Then buys from medium-priced listing
        marketplace::buy_shares(&investor3, listing2, initial_distribution / 4);
        
        // Verify investor3's portfolio
        let investor3_final_balance = fractional::get_share_balance(domain_obj, INVESTOR3_ADDR);
        let expected_balance = initial_distribution + (initial_distribution / 4) + (initial_distribution / 4);
        assert!(investor3_final_balance == expected_balance, 5);
        
        // Phase 4: Verify marketplace statistics
        let (total_volume, total_trades, _, _) = marketplace::get_marketplace_stats();
        let expected_volume = (PRICE_PER_SHARE * (initial_distribution / 4)) + 
                             (PRICE_PER_SHARE * 2 * (initial_distribution / 4));
        assert!(total_volume == expected_volume, 6);
        assert!(total_trades == 2, 7);
        
        // Phase 5: Verify fee collection
        let expected_fees = (expected_volume * TRADING_FEE_BPS) / 10000;
        assert!(coin::balance<AptosCoin>(FEE_COLLECTOR_ADDR) == expected_fees, 8);
        
        // Phase 6: Verify total supply conservation
        let total_distributed = fractional::get_share_balance(domain_obj, DOMAIN_OWNER_ADDR) +
                               fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) +
                               fractional::get_share_balance(domain_obj, INVESTOR2_ADDR) +
                               fractional::get_share_balance(domain_obj, INVESTOR3_ADDR);
        assert!(total_distributed == TOTAL_SUPPLY, 9);
    }    #[test]

    fun test_system_pause_and_recovery() {
        let admin = setup_complete_test_env();
        let (domain_owner, investor1, _investor2, _investor3, _oracle1, _oracle2, _oracle3, _fee_collector) = create_all_test_users();
        
        // Create domain and set up trading
        let domain_obj = domain_registry::create_domain_object(
            &domain_owner,
            string::utf8(TEST_DOMAIN_NAME),
            string::utf8(TEST_VERIFICATION_HASH),
            create_test_valuation(),
            option::some(create_test_fractional_config(TEST_TICKER))
        );
        
        fractional::initialize_fractional_ownership(&domain_owner, domain_obj, TOTAL_SUPPLY, string::utf8(TEST_TICKER));
        let listing_obj = marketplace::create_listing(&domain_owner, domain_obj, PRICE_PER_SHARE, SHARES_TO_LIST);
        
        // Verify normal operations work
        marketplace::buy_shares(&investor1, listing_obj, SHARES_TO_BUY);
        assert!(fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) == SHARES_TO_BUY, 1);
        
        // Pause systems
        domain_registry::pause_registry(&admin);
        marketplace::pause_marketplace(&admin);
        
        // Verify systems are paused
        assert!(domain_registry::is_registry_paused(), 2);
        assert!(marketplace::is_marketplace_paused(), 3);
        
        // Unpause systems
        domain_registry::unpause_registry(&admin);
        marketplace::unpause_marketplace(&admin);
        
        // Verify systems are operational again
        assert!(!domain_registry::is_registry_paused(), 4);
        assert!(!marketplace::is_marketplace_paused(), 5);
        
        // Verify operations work after unpause
        marketplace::buy_shares(&investor1, listing_obj, SHARES_TO_BUY);
        assert!(fractional::get_share_balance(domain_obj, INVESTOR1_ADDR) == SHARES_TO_BUY * 2, 6);
    }
}