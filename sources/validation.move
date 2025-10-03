module orbiter::validation {
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::object::{Self, Object};
    use orbiter::domain_registry::{Self, DomainAsset, ValuationData};

    // ================================
    // Error Codes for Input Validation
    // ================================
    
    /// Input validation errors
    const EINVALID_DOMAIN_NAME: u64 = 100;
    const EINVALID_VERIFICATION_HASH: u64 = 101;
    const EINVALID_ADDRESS: u64 = 102;
    const EINVALID_AMOUNT: u64 = 103;
    const EINVALID_PRICE: u64 = 104;
    const EINVALID_SHARES: u64 = 105;
    const EINVALID_PERCENTAGE: u64 = 106;
    const EINVALID_TIMESTAMP: u64 = 107;
    const EINVALID_STRING_LENGTH: u64 = 108;
    const EINVALID_VECTOR_LENGTH: u64 = 109;
    const EINVALID_RANGE: u64 = 110;
    const EINVALID_VALUATION_DATA: u64 = 111;
    const EINVALID_TICKER_SYMBOL: u64 = 112;
    const EINVALID_SUPPLY: u64 = 113;
    const EINVALID_FEE_BPS: u64 = 114;
    const EINVALID_CONSENSUS: u64 = 115;
    const EINVALID_FREQUENCY: u64 = 116;

    // ================================
    // Constants for Validation Limits
    // ================================
    
    /// Domain name constraints
    const MIN_DOMAIN_LENGTH: u64 = 3;
    const MAX_DOMAIN_LENGTH: u64 = 253;
    
    /// Verification hash constraints
    const MIN_HASH_LENGTH: u64 = 32;
    const MAX_HASH_LENGTH: u64 = 128;
    
    /// Ticker symbol constraints
    const MIN_TICKER_LENGTH: u64 = 1;
    const MAX_TICKER_LENGTH: u64 = 10;
    
    /// Share supply constraints
    const MIN_SHARE_SUPPLY: u64 = 1;
    const MAX_SHARE_SUPPLY: u64 = 1000000000000; // 1 trillion
    
    /// Price constraints (in octas)
    const MIN_PRICE: u64 = 1; // 1 octa minimum
    const MAX_PRICE: u64 = 1000000000000000000; // 1 billion APT
    
    /// Fee constraints (basis points)
    const MAX_FEE_BPS: u64 = 1000; // 10% maximum
    
    /// Valuation score constraints
    const MAX_VALUATION_SCORE: u64 = 1000;
    const MAX_INDIVIDUAL_SCORE: u64 = 100;
    const MAX_MARKET_VALUE: u64 = 1000000000000000; // 1M APT in octas
    
    /// Oracle constraints
    const MIN_ORACLES: u64 = 1;
    const MAX_ORACLES: u64 = 100;
    const MIN_UPDATE_FREQUENCY: u64 = 3600; // 1 hour minimum
    
    /// Vector length constraints
    const MAX_VECTOR_LENGTH: u64 = 1000;

    // ================================
    // Address Validation Functions
    // ================================

    /// Validate that an address is not zero
    public fun validate_address(addr: address) {
        assert!(addr != @0x0, EINVALID_ADDRESS);
    }

    /// Validate multiple addresses
    public fun validate_addresses(addresses: &vector<address>) {
        let len = vector::length(addresses);
        assert!(len > 0, EINVALID_VECTOR_LENGTH);
        assert!(len <= MAX_VECTOR_LENGTH, EINVALID_VECTOR_LENGTH);
        
        let i = 0;
        while (i < len) {
            validate_address(*vector::borrow(addresses, i));
            i = i + 1;
        };
    }

    /// Validate addresses are unique (no duplicates)
    public fun validate_unique_addresses(addresses: &vector<address>) {
        let len = vector::length(addresses);
        let i = 0;
        
        while (i < len) {
            let addr = *vector::borrow(addresses, i);
            let j = i + 1;
            
            while (j < len) {
                assert!(*vector::borrow(addresses, j) != addr, EINVALID_ADDRESS);
                j = j + 1;
            };
            i = i + 1;
        };
    }

    // ================================
    // String Validation Functions
    // ================================

    /// Validate domain name format and constraints
    public fun validate_domain_name(domain_name: &String) {
        let domain_bytes = string::bytes(domain_name);
        let length = vector::length(domain_bytes);
        
        // Check length constraints
        assert!(length >= MIN_DOMAIN_LENGTH, EINVALID_DOMAIN_NAME);
        assert!(length <= MAX_DOMAIN_LENGTH, EINVALID_DOMAIN_NAME);
        
        // Domain must contain at least one dot
        let has_dot = false;
        let i = 0;
        while (i < length) {
            let byte = *vector::borrow(domain_bytes, i);
            if (byte == 46) { // ASCII for '.'
                has_dot = true;
                break
            };
            i = i + 1;
        };
        assert!(has_dot, EINVALID_DOMAIN_NAME);
        
        // Validate characters (basic ASCII check)
        i = 0;
        while (i < length) {
            let byte = *vector::borrow(domain_bytes, i);
            // Allow alphanumeric, dots, and hyphens
            assert!(
                (byte >= 48 && byte <= 57) ||  // 0-9
                (byte >= 65 && byte <= 90) ||  // A-Z
                (byte >= 97 && byte <= 122) || // a-z
                byte == 46 ||                  // .
                byte == 45,                    // -
                EINVALID_DOMAIN_NAME
            );
            i = i + 1;
        };
    }

    /// Validate verification hash format
    public fun validate_verification_hash(hash: &String) {
        let hash_bytes = string::bytes(hash);
        let length = vector::length(hash_bytes);
        
        // Check length constraints
        assert!(length >= MIN_HASH_LENGTH, EINVALID_VERIFICATION_HASH);
        assert!(length <= MAX_HASH_LENGTH, EINVALID_VERIFICATION_HASH);
        
        // Validate hex characters
        let i = 0;
        while (i < length) {
            let byte = *vector::borrow(hash_bytes, i);
            assert!(
                (byte >= 48 && byte <= 57) ||  // 0-9
                (byte >= 65 && byte <= 70) ||  // A-F
                (byte >= 97 && byte <= 102),   // a-f
                EINVALID_VERIFICATION_HASH
            );
            i = i + 1;
        };
    }

    /// Validate ticker symbol format
    public fun validate_ticker_symbol(ticker: &String) {
        let ticker_bytes = string::bytes(ticker);
        let length = vector::length(ticker_bytes);
        
        // Check length constraints
        assert!(length >= MIN_TICKER_LENGTH, EINVALID_TICKER_SYMBOL);
        assert!(length <= MAX_TICKER_LENGTH, EINVALID_TICKER_SYMBOL);
        
        // Validate characters (uppercase letters and numbers only)
        let i = 0;
        while (i < length) {
            let byte = *vector::borrow(ticker_bytes, i);
            assert!(
                (byte >= 48 && byte <= 57) ||  // 0-9
                (byte >= 65 && byte <= 90),    // A-Z
                EINVALID_TICKER_SYMBOL
            );
            i = i + 1;
        };
    }

    /// Validate string length within bounds
    public fun validate_string_length(str: &String, min_len: u64, max_len: u64) {
        let length = string::length(str);
        assert!(length >= min_len, EINVALID_STRING_LENGTH);
        assert!(length <= max_len, EINVALID_STRING_LENGTH);
    }

    // ================================
    // Numerical Validation Functions
    // ================================

    /// Validate amount is positive
    public fun validate_positive_amount(amount: u64) {
        assert!(amount > 0, EINVALID_AMOUNT);
    }

    /// Validate amount is within range
    public fun validate_amount_range(amount: u64, min_amount: u64, max_amount: u64) {
        assert!(amount >= min_amount, EINVALID_AMOUNT);
        assert!(amount <= max_amount, EINVALID_AMOUNT);
    }

    /// Validate price is within acceptable range
    public fun validate_price(price: u64) {
        assert!(price >= MIN_PRICE, EINVALID_PRICE);
        assert!(price <= MAX_PRICE, EINVALID_PRICE);
    }

    /// Validate share amount
    public fun validate_shares(shares: u64) {
        assert!(shares > 0, EINVALID_SHARES);
    }

    /// Validate share supply constraints
    public fun validate_share_supply(total_supply: u64) {
        assert!(total_supply >= MIN_SHARE_SUPPLY, EINVALID_SUPPLY);
        assert!(total_supply <= MAX_SHARE_SUPPLY, EINVALID_SUPPLY);
    }

    /// Validate percentage (0-100)
    public fun validate_percentage(percentage: u64) {
        assert!(percentage <= 100, EINVALID_PERCENTAGE);
    }

    /// Validate basis points (0-10000, representing 0-100%)
    public fun validate_basis_points(bps: u64) {
        assert!(bps <= 10000, EINVALID_PERCENTAGE);
    }

    /// Validate trading fee in basis points
    public fun validate_trading_fee(fee_bps: u64) {
        assert!(fee_bps <= MAX_FEE_BPS, EINVALID_FEE_BPS);
    }

    /// Validate timestamp is not in the future
    public fun validate_timestamp_not_future(timestamp: u64) {
        use aptos_framework::timestamp as aptos_timestamp;
        let current_time = aptos_timestamp::now_seconds();
        assert!(timestamp <= current_time, EINVALID_TIMESTAMP);
    }

    /// Validate timestamp is reasonable (not too old)
    public fun validate_timestamp_reasonable(timestamp: u64, max_age_seconds: u64) {
        use aptos_framework::timestamp as aptos_timestamp;
        let current_time = aptos_timestamp::now_seconds();
        assert!(timestamp <= current_time, EINVALID_TIMESTAMP);
        assert!(current_time - timestamp <= max_age_seconds, EINVALID_TIMESTAMP);
    }

    // ================================
    // Vector Validation Functions
    // ================================

    /// Validate vector length is within bounds
    public fun validate_vector_length<T>(vec: &vector<T>, min_len: u64, max_len: u64) {
        let length = vector::length(vec);
        assert!(length >= min_len, EINVALID_VECTOR_LENGTH);
        assert!(length <= max_len, EINVALID_VECTOR_LENGTH);
    }

    /// Validate two vectors have the same length
    public fun validate_equal_vector_lengths<T, U>(vec1: &vector<T>, vec2: &vector<U>) {
        let len1 = vector::length(vec1);
        let len2 = vector::length(vec2);
        assert!(len1 == len2, EINVALID_VECTOR_LENGTH);
    }

    /// Validate vector is not empty
    public fun validate_non_empty_vector<T>(vec: &vector<T>) {
        assert!(vector::length(vec) > 0, EINVALID_VECTOR_LENGTH);
    }

    // ================================
    // Valuation Data Validation Functions
    // ================================

    /// Validate valuation data fields are within acceptable ranges
    public fun validate_valuation_data(valuation: &ValuationData) {
        // Overall score should be 0-1000
        let score = domain_registry::get_valuation_score(valuation);
        assert!(score <= MAX_VALUATION_SCORE, EINVALID_VALUATION_DATA);
        
        // Individual scores should be 0-100
        let seo_authority = domain_registry::get_valuation_seo_authority(valuation);
        assert!(seo_authority <= MAX_INDIVIDUAL_SCORE, EINVALID_VALUATION_DATA);
        
        let traffic_estimate = domain_registry::get_valuation_traffic_estimate(valuation);
        assert!(traffic_estimate <= MAX_INDIVIDUAL_SCORE, EINVALID_VALUATION_DATA);
        
        let brandability = domain_registry::get_valuation_brandability(valuation);
        assert!(brandability <= MAX_INDIVIDUAL_SCORE, EINVALID_VALUATION_DATA);
        
        let tld_rarity = domain_registry::get_valuation_tld_rarity(valuation);
        assert!(tld_rarity <= MAX_INDIVIDUAL_SCORE, EINVALID_VALUATION_DATA);
        
        // Market value should be reasonable
        let market_value = domain_registry::get_valuation_market_value(valuation);
        assert!(market_value > 0, EINVALID_VALUATION_DATA);
        assert!(market_value <= MAX_MARKET_VALUE, EINVALID_VALUATION_DATA);
        
        // Updated timestamp should not be in the future
        let updated_at = domain_registry::get_valuation_updated_at(valuation);
        validate_timestamp_not_future(updated_at);
    }

    // ================================
    // Oracle System Validation Functions
    // ================================

    /// Validate oracle configuration parameters
    public fun validate_oracle_config(
        oracles: &vector<address>,
        min_consensus: u64,
        update_frequency: u64
    ) {
        // Validate oracle addresses
        validate_addresses(oracles);
        validate_unique_addresses(oracles);
        
        let oracle_count = vector::length(oracles);
        assert!(oracle_count >= MIN_ORACLES, EINVALID_CONSENSUS);
        assert!(oracle_count <= MAX_ORACLES, EINVALID_CONSENSUS);
        
        // Validate consensus requirements
        assert!(min_consensus > 0, EINVALID_CONSENSUS);
        assert!(min_consensus <= oracle_count, EINVALID_CONSENSUS);
        
        // Validate update frequency
        assert!(update_frequency >= MIN_UPDATE_FREQUENCY, EINVALID_FREQUENCY);
    }

    /// Validate consensus count is achievable
    public fun validate_consensus_achievable(min_consensus: u64, total_oracles: u64) {
        assert!(min_consensus > 0, EINVALID_CONSENSUS);
        assert!(min_consensus <= total_oracles, EINVALID_CONSENSUS);
    }

    // ================================
    // Domain Object Validation Functions
    // ================================

    /// Validate domain object exists and is accessible
    public fun validate_domain_object_exists(domain_obj: Object<DomainAsset>) {
        let domain_addr = object::object_address(&domain_obj);
        // This will be checked by the calling functions that access the domain
        // We just validate the object address is not zero
        validate_address(domain_addr);
    }

    /// Validate domain ownership
    public fun validate_domain_ownership(domain_obj: Object<DomainAsset>, expected_owner: address) {
        validate_address(expected_owner);
        assert!(domain_registry::is_domain_owner(domain_obj, expected_owner), EINVALID_ADDRESS);
    }

    // ================================
    // Marketplace Validation Functions
    // ================================

    /// Validate listing creation parameters
    public fun validate_listing_params(
        seller: address,
        price_per_share: u64,
        shares_to_sell: u64
    ) {
        validate_address(seller);
        validate_price(price_per_share);
        validate_shares(shares_to_sell);
    }

    /// Validate trade execution parameters
    public fun validate_trade_params(
        buyer: address,
        seller: address,
        shares_to_buy: u64,
        price_per_share: u64
    ) {
        validate_address(buyer);
        validate_address(seller);
        validate_shares(shares_to_buy);
        validate_price(price_per_share);
        
        // Ensure buyer and seller are different
        assert!(buyer != seller, EINVALID_ADDRESS);
    }

    // ================================
    // Fractional Ownership Validation Functions
    // ================================

    /// Validate share transfer parameters
    public fun validate_share_transfer_params(
        from: address,
        to: address,
        amount: u64
    ) {
        validate_address(from);
        validate_address(to);
        validate_shares(amount);
        
        // Ensure from and to are different
        assert!(from != to, EINVALID_ADDRESS);
    }

    /// Validate allowance parameters
    public fun validate_allowance_params(
        owner: address,
        spender: address,
        _amount: u64
    ) {
        validate_address(owner);
        validate_address(spender);
        // Amount can be zero for allowance (to revoke)
        
        // Ensure owner and spender are different
        assert!(owner != spender, EINVALID_ADDRESS);
    }

    /// Validate batch transfer parameters
    public fun validate_batch_transfer_params(
        recipients: &vector<address>,
        amounts: &vector<u64>
    ) {
        validate_non_empty_vector(recipients);
        validate_non_empty_vector(amounts);
        validate_equal_vector_lengths(recipients, amounts);
        validate_vector_length(recipients, 1, MAX_VECTOR_LENGTH);
        
        // Validate all recipients and amounts
        let len = vector::length(recipients);
        let i = 0;
        while (i < len) {
            validate_address(*vector::borrow(recipients, i));
            validate_shares(*vector::borrow(amounts, i));
            i = i + 1;
        };
        
        // Validate recipients are unique
        validate_unique_addresses(recipients);
    }

    // ================================
    // Comprehensive Validation Functions
    // ================================

    /// Validate all parameters for domain creation
    public fun validate_domain_creation_inputs(
        creator: address,
        domain_name: &String,
        verification_hash: &String,
        valuation: &ValuationData
    ) {
        validate_address(creator);
        validate_domain_name(domain_name);
        validate_verification_hash(verification_hash);
        validate_valuation_data(valuation);
    }

    /// Validate all parameters for fractional ownership initialization
    public fun validate_fractional_initialization_inputs(
        owner: address,
        total_supply: u64,
        ticker: &String
    ) {
        validate_address(owner);
        validate_share_supply(total_supply);
        validate_ticker_symbol(ticker);
    }

    /// Validate all parameters for marketplace initialization
    public fun validate_marketplace_initialization_inputs(
        admin: address,
        trading_fee_bps: u64,
        fee_collector: address
    ) {
        validate_address(admin);
        validate_address(fee_collector);
        validate_trading_fee(trading_fee_bps);
    }

    // ================================
    // Range and Boundary Validation Functions
    // ================================

    /// Validate value is within inclusive range
    public fun validate_range_inclusive(value: u64, min_val: u64, max_val: u64) {
        assert!(value >= min_val, EINVALID_RANGE);
        assert!(value <= max_val, EINVALID_RANGE);
    }

    /// Validate value is within exclusive range
    public fun validate_range_exclusive(value: u64, min_val: u64, max_val: u64) {
        assert!(value > min_val, EINVALID_RANGE);
        assert!(value < max_val, EINVALID_RANGE);
    }

    /// Validate mathematical operation won't overflow
    public fun validate_no_overflow_add(a: u64, b: u64) {
        assert!(a <= 18446744073709551615 - b, EINVALID_AMOUNT); // u64::MAX - b
    }

    /// Validate mathematical operation won't underflow
    public fun validate_no_underflow_sub(a: u64, b: u64) {
        assert!(a >= b, EINVALID_AMOUNT);
    }

    /// Validate sufficient balance for operation
    public fun validate_sufficient_balance(current_balance: u64, required_amount: u64) {
        assert!(current_balance >= required_amount, EINVALID_AMOUNT);
    }

    /// Validate division by zero
    public fun validate_non_zero_divisor(divisor: u64) {
        assert!(divisor > 0, EINVALID_AMOUNT);
    }

    // ================================
    // Getter Functions for Constants
    // ================================

    /// Get minimum domain length
    public fun get_min_domain_length(): u64 { MIN_DOMAIN_LENGTH }
    
    /// Get maximum domain length
    public fun get_max_domain_length(): u64 { MAX_DOMAIN_LENGTH }
    
    /// Get minimum hash length
    public fun get_min_hash_length(): u64 { MIN_HASH_LENGTH }
    
    /// Get maximum hash length
    public fun get_max_hash_length(): u64 { MAX_HASH_LENGTH }
    
    /// Get minimum ticker length
    public fun get_min_ticker_length(): u64 { MIN_TICKER_LENGTH }
    
    /// Get maximum ticker length
    public fun get_max_ticker_length(): u64 { MAX_TICKER_LENGTH }
    
    /// Get minimum share supply
    public fun get_min_share_supply(): u64 { MIN_SHARE_SUPPLY }
    
    /// Get maximum share supply
    public fun get_max_share_supply(): u64 { MAX_SHARE_SUPPLY }
    
    /// Get minimum price
    public fun get_min_price(): u64 { MIN_PRICE }
    
    /// Get maximum price
    public fun get_max_price(): u64 { MAX_PRICE }
    
    /// Get maximum fee in basis points
    public fun get_max_fee_bps(): u64 { MAX_FEE_BPS }
    
    /// Get maximum valuation score
    public fun get_max_valuation_score(): u64 { MAX_VALUATION_SCORE }
    
    /// Get maximum individual score
    public fun get_max_individual_score(): u64 { MAX_INDIVIDUAL_SCORE }
    
    /// Get maximum market value
    public fun get_max_market_value(): u64 { MAX_MARKET_VALUE }
}