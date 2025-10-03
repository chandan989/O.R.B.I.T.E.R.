module orbiter::valuation {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::event;
    use aptos_framework::timestamp;

    use orbiter::domain_registry::{Self, DomainAsset, ValuationData};

    // ================================
    // Error Codes
    // ================================
    
    /// Valuation oracle errors
    const EINVALID_ORACLE: u64 = 32;
    const EORACLE_NOT_AUTHORIZED: u64 = 33;
    const EVALUATION_ORACLE_NOT_INITIALIZED: u64 = 34;
    const EPENDING_VALUATION_EXISTS: u64 = 35;
    const EPENDING_VALUATION_NOT_FOUND: u64 = 36;
    const EVALUATION_UPDATE_TOO_FREQUENT: u64 = 37;
    const EINSUFFICIENT_CONSENSUS: u64 = 38;
    const EVALUATION_EXPIRED: u64 = 39;
    const EORACLE_ALREADY_VOTED: u64 = 40;
    const EINVALID_VALUATION_DATA: u64 = 41;
    const EMIN_CONSENSUS_TOO_HIGH: u64 = 42;
    const EORACLE_ALREADY_EXISTS: u64 = 43;
    const EORACLE_NOT_FOUND: u64 = 44;
    
    /// System errors
    const ESYSTEM_PAUSED: u64 = 30;
    const EUNAUTHORIZED_ADMIN: u64 = 31;
    const EZERO_ADDRESS: u64 = 45;

    // ================================
    // Data Structures
    // ================================

    /// Valuation oracle configuration and management
    struct ValuationOracle has key {
        /// Authorized oracle addresses
        authorized_oracles: vector<address>,
        /// Minimum oracles required for consensus
        min_consensus: u64,
        /// Valuation update frequency in seconds (minimum time between updates)
        update_frequency: u64,
        /// Admin address for oracle management
        admin: address,
        /// Whether the oracle system is paused
        paused: bool,
        /// Total number of valuations processed
        total_valuations: u64,
        /// Next valuation ID to assign
        next_valuation_id: u64,
    }

    /// Pending valuation update awaiting consensus
    struct PendingValuation has key, drop {
        /// Domain object being valued
        domain_object: Object<DomainAsset>,
        /// Proposed valuation data
        proposed_valuation: ValuationData,
        /// List of oracles who have voted
        voted_oracles: vector<address>,
        /// Number of votes received
        votes_count: u64,
        /// When this valuation expires
        expires_at: u64,
        /// When this valuation was created
        created_at: u64,
        /// Valuation ID for tracking
        valuation_id: u64,
        /// Address of the oracle who initiated this valuation
        initiator: address,
    }

    /// Historical valuation record
    struct ValuationHistory has key {
        /// Domain object this history belongs to
        domain_object: Object<DomainAsset>,
        /// Historical valuation records
        valuations: vector<HistoricalValuation>,
        /// Last update timestamp
        last_updated: u64,
    }

    /// Individual historical valuation entry
    struct HistoricalValuation has store, drop, copy {
        /// Valuation data at this point in time
        valuation: ValuationData,
        /// Timestamp when this valuation was applied
        timestamp: u64,
        /// Valuation ID for tracking
        valuation_id: u64,
        /// Number of oracles that voted for this valuation
        consensus_count: u64,
    }

    // ================================
    // Events
    // ================================

    #[event]
    /// Event emitted when valuation oracle is initialized
    struct ValuationOracleInitialized has store, drop {
        /// Admin address
        admin: address,
        /// Initial authorized oracles
        initial_oracles: vector<address>,
        /// Minimum consensus required
        min_consensus: u64,
        /// Update frequency in seconds
        update_frequency: u64,
        /// Timestamp of initialization
        timestamp: u64,
    }

    #[event]
    /// Event emitted when a new valuation update is proposed
    struct ValuationUpdateProposed has store, drop {
        /// Domain object being valued
        domain_object: address,
        /// Domain name for reference
        domain_name: String,
        /// Oracle who proposed the update
        oracle: address,
        /// Proposed valuation data
        proposed_valuation: ValuationData,
        /// Valuation ID
        valuation_id: u64,
        /// When this proposal expires
        expires_at: u64,
        /// Timestamp of proposal
        timestamp: u64,
    }

    #[event]
    /// Event emitted when an oracle votes on a valuation
    struct ValuationVoteCast has store, drop {
        /// Domain object being valued
        domain_object: address,
        /// Oracle who voted
        oracle: address,
        /// Valuation ID being voted on
        valuation_id: u64,
        /// Current vote count after this vote
        current_votes: u64,
        /// Minimum votes needed for consensus
        required_votes: u64,
        /// Timestamp of vote
        timestamp: u64,
    }

    #[event]
    /// Event emitted when valuation consensus is reached and applied
    struct ValuationConsensusReached has store, drop {
        /// Domain object that was valued
        domain_object: address,
        /// Domain name for reference
        domain_name: String,
        /// Previous valuation data
        old_valuation: ValuationData,
        /// New valuation data
        new_valuation: ValuationData,
        /// Valuation ID
        valuation_id: u64,
        /// Number of oracles that voted
        consensus_count: u64,
        /// Timestamp when consensus was reached
        timestamp: u64,
    }

    #[event]
    /// Event emitted when oracle is added or removed
    struct OracleUpdated has store, drop {
        /// Admin who made the change
        admin: address,
        /// Oracle address affected
        oracle: address,
        /// Whether oracle was added (true) or removed (false)
        added: bool,
        /// Total number of oracles after this change
        total_oracles: u64,
        /// Timestamp of change
        timestamp: u64,
    }

    #[event]
    /// Event emitted when oracle settings are updated
    struct OracleSettingsUpdated has store, drop {
        /// Admin who made the change
        admin: address,
        /// Old minimum consensus
        old_min_consensus: u64,
        /// New minimum consensus
        new_min_consensus: u64,
        /// Old update frequency
        old_update_frequency: u64,
        /// New update frequency
        new_update_frequency: u64,
        /// Timestamp of change
        timestamp: u64,
    }

    // ================================
    // Helper Functions
    // ================================

    /// Validate that an address is not zero (deprecated - use validation module)
    fun validate_address(addr: address) {
        use orbiter::validation;
        validation::validate_address(addr);
    }

    /// Validate valuation data is within acceptable ranges (deprecated - use validation module)
    fun validate_valuation_data(valuation: &ValuationData): bool {
        use orbiter::validation;
        validation::validate_valuation_data(valuation);
        true
    }

    /// Check if an address is an authorized oracle
    fun is_authorized_oracle(oracle_addr: address): bool acquires ValuationOracle {
        if (!exists<ValuationOracle>(@orbiter)) {
            return false
        };
        
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        vector::contains(&oracle_system.authorized_oracles, &oracle_addr)
    }

    /// Get oracle index in the authorized list
    fun get_oracle_index(oracle_addr: address): u64 acquires ValuationOracle {
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        let len = vector::length(&oracle_system.authorized_oracles);
        let i = 0;
        
        while (i < len) {
            if (*vector::borrow(&oracle_system.authorized_oracles, i) == oracle_addr) {
                return i
            };
            i = i + 1;
        };
        
        // This should not be reached if oracle is authorized
        abort EORACLE_NOT_FOUND
    }

    /// Check if enough time has passed since last valuation update
    fun can_update_valuation(domain_obj: Object<DomainAsset>): bool acquires ValuationOracle {
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        let current_valuation = domain_registry::get_domain_valuation(domain_obj);
        let current_time = timestamp::now_seconds();
        
        (current_time - domain_registry::get_valuation_updated_at(&current_valuation)) >= oracle_system.update_frequency
    }

    /// Generate unique pending valuation key for a domain
    fun get_pending_valuation_key(domain_obj: Object<DomainAsset>): address {
        object::object_address(&domain_obj)
    }

    // ================================
    // Oracle System Initialization
    // ================================

    /// Initialize the valuation oracle system
    public fun initialize_valuation_oracle(
        admin: &signer,
        initial_oracles: vector<address>,
        min_consensus: u64,
        update_frequency: u64
    ) {
        use orbiter::validation;
        
        let admin_addr = signer::address_of(admin);
        
        // Comprehensive input validation
        validation::validate_oracle_config(&initial_oracles, min_consensus, update_frequency);
        validation::validate_address(admin_addr);
        
        // Ensure oracle system doesn't already exist
        assert!(!exists<ValuationOracle>(admin_addr), EVALUATION_ORACLE_NOT_INITIALIZED);
        
        // Create the oracle system
        let oracle_system = ValuationOracle {
            authorized_oracles: initial_oracles,
            min_consensus,
            update_frequency,
            admin: admin_addr,
            paused: false,
            total_valuations: 0,
            next_valuation_id: 1,
        };
        
        move_to(admin, oracle_system);
        
        // Emit initialization event
        event::emit(ValuationOracleInitialized {
            admin: admin_addr,
            initial_oracles,
            min_consensus,
            update_frequency,
            timestamp: timestamp::now_seconds(),
        });
    }

    // ================================
    // Oracle Management Functions
    // ================================

    /// Add a new authorized oracle (admin only)
    public fun add_oracle(
        admin: &signer,
        new_oracle: address
    ) acquires ValuationOracle {
        use orbiter::validation;
        use orbiter::security;
        
        let admin_addr = signer::address_of(admin);
        
        // Comprehensive input validation
        validation::validate_address(admin_addr);
        validation::validate_address(new_oracle);
        assert!(admin_addr != new_oracle, EORACLE_ALREADY_EXISTS);
        
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global_mut<ValuationOracle>(@orbiter);
        
        // Access control and security checks
        security::verify_oracle_management_access(admin, oracle_system.admin);
        
        // Check if oracle is already authorized
        assert!(!vector::contains(&oracle_system.authorized_oracles, &new_oracle), EORACLE_ALREADY_EXISTS);
        
        // Add the new oracle
        vector::push_back(&mut oracle_system.authorized_oracles, new_oracle);
        let total_oracles = vector::length(&oracle_system.authorized_oracles);
        
        // Emit oracle added event
        event::emit(OracleUpdated {
            admin: admin_addr,
            oracle: new_oracle,
            added: true,
            total_oracles,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Remove an authorized oracle (admin only)
    public fun remove_oracle(
        admin: &signer,
        oracle_to_remove: address
    ) acquires ValuationOracle {
        use orbiter::validation;
        
        let admin_addr = signer::address_of(admin);
        
        // Comprehensive input validation
        validation::validate_address(admin_addr);
        validation::validate_address(oracle_to_remove);
        
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        
        // First check authorization and get oracle index
        let oracle_index = {
            let oracle_system = borrow_global<ValuationOracle>(@orbiter);
            assert!(oracle_system.admin == admin_addr, EUNAUTHORIZED_ADMIN);
            assert!(vector::contains(&oracle_system.authorized_oracles, &oracle_to_remove), EORACLE_NOT_FOUND);
            get_oracle_index(oracle_to_remove)
        };
        
        // Now mutably borrow and perform the removal
        let oracle_system = borrow_global_mut<ValuationOracle>(@orbiter);
        vector::remove(&mut oracle_system.authorized_oracles, oracle_index);
        
        let total_oracles = vector::length(&oracle_system.authorized_oracles);
        
        // Ensure we still have enough oracles for minimum consensus
        assert!(total_oracles >= oracle_system.min_consensus, EMIN_CONSENSUS_TOO_HIGH);
        
        // Emit oracle removed event
        event::emit(OracleUpdated {
            admin: admin_addr,
            oracle: oracle_to_remove,
            added: false,
            total_oracles,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Update oracle system settings (admin only)
    public fun update_oracle_settings(
        admin: &signer,
        new_min_consensus: u64,
        new_update_frequency: u64
    ) acquires ValuationOracle {
        let admin_addr = signer::address_of(admin);
        
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global_mut<ValuationOracle>(@orbiter);
        assert!(oracle_system.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        
        // Validate new settings
        let oracle_count = vector::length(&oracle_system.authorized_oracles);
        assert!(new_min_consensus > 0 && new_min_consensus <= oracle_count, EMIN_CONSENSUS_TOO_HIGH);
        assert!(new_update_frequency > 0, EVALUATION_UPDATE_TOO_FREQUENT);
        
        let old_min_consensus = oracle_system.min_consensus;
        let old_update_frequency = oracle_system.update_frequency;
        
        // Update settings
        oracle_system.min_consensus = new_min_consensus;
        oracle_system.update_frequency = new_update_frequency;
        
        // Emit settings update event
        event::emit(OracleSettingsUpdated {
            admin: admin_addr,
            old_min_consensus,
            new_min_consensus,
            old_update_frequency,
            new_update_frequency,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Pause the oracle system (admin only)
    public fun pause_oracle_system(admin: &signer) acquires ValuationOracle {
        let admin_addr = signer::address_of(admin);
        
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global_mut<ValuationOracle>(@orbiter);
        assert!(oracle_system.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        
        oracle_system.paused = true;
    }

    /// Unpause the oracle system (admin only)
    public fun unpause_oracle_system(admin: &signer) acquires ValuationOracle {
        let admin_addr = signer::address_of(admin);
        
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global_mut<ValuationOracle>(@orbiter);
        assert!(oracle_system.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        
        oracle_system.paused = false;
    }

    /// Update oracle system admin (current admin only)
    public fun update_oracle_admin(
        current_admin: &signer,
        new_admin: address
    ) acquires ValuationOracle {
        let current_admin_addr = signer::address_of(current_admin);
        validate_address(new_admin);
        
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global_mut<ValuationOracle>(@orbiter);
        assert!(oracle_system.admin == current_admin_addr, EUNAUTHORIZED_ADMIN);
        
        oracle_system.admin = new_admin;
    }

    // ================================
    // Oracle Query Functions
    // ================================

    /// Check if oracle system is initialized
    public fun is_oracle_system_initialized(): bool {
        exists<ValuationOracle>(@orbiter)
    }

    /// Check if oracle system is paused
    public fun is_oracle_system_paused(): bool acquires ValuationOracle {
        if (!exists<ValuationOracle>(@orbiter)) {
            return true
        };
        
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        oracle_system.paused
    }

    /// Get oracle system admin
    public fun get_oracle_admin(): address acquires ValuationOracle {
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        oracle_system.admin
    }

    /// Get all authorized oracles
    public fun get_authorized_oracles(): vector<address> acquires ValuationOracle {
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        oracle_system.authorized_oracles
    }

    /// Get minimum consensus requirement
    public fun get_min_consensus(): u64 acquires ValuationOracle {
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        oracle_system.min_consensus
    }

    /// Get update frequency setting
    public fun get_update_frequency(): u64 acquires ValuationOracle {
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        oracle_system.update_frequency
    }

    /// Get oracle system statistics
    public fun get_oracle_stats(): (u64, u64, u64, u64) acquires ValuationOracle {
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        
        (
            vector::length(&oracle_system.authorized_oracles),
            oracle_system.min_consensus,
            oracle_system.total_valuations,
            oracle_system.next_valuation_id - 1
        )
    }

    /// Check if an address is an authorized oracle (public version)
    public fun is_oracle_authorized(oracle_addr: address): bool acquires ValuationOracle {
        is_authorized_oracle(oracle_addr)
    }

    /// Check if a domain can be updated (frequency check)
    public fun can_domain_be_updated(domain_obj: Object<DomainAsset>): bool acquires ValuationOracle {
        if (!exists<ValuationOracle>(@orbiter)) {
            return false
        };
        
        can_update_valuation(domain_obj)
    }

    // ================================
    // Valuation Calculation Functions
    // ================================
    // Public View Functions
    // ================================

    #[view]
    /// Calculate initial valuation for a new domain based on domain characteristics
    public fun calculate_initial_valuation(
        domain_name: String,
        _verification_data: vector<u8>
    ): ValuationData {
        use aptos_framework::timestamp;
        
        let current_time = timestamp::now_seconds();
        
        // Extract domain characteristics for scoring
        let domain_length = string::length(&domain_name);
        let domain_bytes = string::bytes(&domain_name);
        
        // Calculate SEO authority score (0-100)
        let seo_authority = calculate_seo_authority_score(&domain_name, domain_length);
        
        // Calculate traffic estimate score (0-100)
        let traffic_estimate = calculate_traffic_estimate_score(&domain_name, domain_length);
        
        // Calculate brandability score (0-100)
        let brandability = calculate_brandability_score(&domain_name, domain_bytes);
        
        // Calculate TLD rarity score (0-100)
        let tld_rarity = calculate_tld_rarity_score(&domain_name);
        
        // Calculate overall score (0-1000) as weighted average
        let overall_score = calculate_overall_score(
            seo_authority,
            traffic_estimate,
            brandability,
            tld_rarity
        );
        
        // Calculate market value based on overall score
        let market_value = calculate_market_value(overall_score, domain_length);
        
        domain_registry::new_valuation_data(
            overall_score,
            market_value,
            seo_authority,
            traffic_estimate,
            brandability,
            tld_rarity,
            current_time
        )
    }

    /// Calculate SEO authority score based on domain characteristics
    fun calculate_seo_authority_score(domain_name: &String, domain_length: u64): u64 {
        let score = 40; // Base score
        
        // Length factor (shorter domains generally have higher authority)
        if (domain_length <= 3) {
            score = score + 50; // Ultra premium short domains
        } else if (domain_length <= 5) {
            score = score + 45; // Super premium
        } else if (domain_length <= 8) {
            score = score + 40; // Premium length
        } else if (domain_length <= 12) {
            score = score + 30; // Good length
        } else if (domain_length <= 15) {
            score = score + 20; // Decent length
        };
        
        // Check for premium domain patterns
        let domain_bytes = string::bytes(domain_name);
        
        // Major tech brands - maximum authority
        if (contains_pattern(domain_bytes, b"google") ||
            contains_pattern(domain_bytes, b"amazon") ||
            contains_pattern(domain_bytes, b"apple") ||
            contains_pattern(domain_bytes, b"microsoft") ||
            contains_pattern(domain_bytes, b"meta") ||
            contains_pattern(domain_bytes, b"tesla")) {
            score = 100; // Maximum score for major brands
        } 
        // High-value generic terms
        else if (contains_pattern(domain_bytes, b"chat") ||
                 contains_pattern(domain_bytes, b"shop") ||
                 contains_pattern(domain_bytes, b"buy") ||
                 contains_pattern(domain_bytes, b"sell") ||
                 contains_pattern(domain_bytes, b"trade") ||
                 contains_pattern(domain_bytes, b"crypto") ||
                 contains_pattern(domain_bytes, b"ai") ||
                 contains_pattern(domain_bytes, b"web3")) {
            score = score + 35; // High bonus for valuable terms
        }
        // Tech/business terms
        else if (contains_pattern(domain_bytes, b"app") ||
                 contains_pattern(domain_bytes, b"api") ||
                 contains_pattern(domain_bytes, b"tech") ||
                 contains_pattern(domain_bytes, b"dev") ||
                 contains_pattern(domain_bytes, b"cloud") ||
                 contains_pattern(domain_bytes, b"data")) {
            score = score + 25; // Good bonus for tech terms
        };
        
        // Ensure score doesn't exceed 100
        if (score > 100) score = 100;
        
        score
    }

    /// Calculate traffic estimate score based on domain characteristics
    fun calculate_traffic_estimate_score(domain_name: &String, domain_length: u64): u64 {
        let score = 30; // Base score
        
        // Domain length impact on memorability and traffic potential
        if (domain_length <= 3) {
            score = score + 60; // Ultra memorable
        } else if (domain_length <= 5) {
            score = score + 50; // Super memorable
        } else if (domain_length <= 8) {
            score = score + 45; // Very memorable
        } else if (domain_length <= 12) {
            score = score + 35; // Good memorability
        } else if (domain_length <= 20) {
            score = score + 25; // Decent memorability
        };
        
        // Check for premium brand indicators
        let domain_bytes = string::bytes(domain_name);
        
        // Major brands get maximum traffic scores
        if (contains_pattern(domain_bytes, b"google") ||
            contains_pattern(domain_bytes, b"amazon") ||
            contains_pattern(domain_bytes, b"apple") ||
            contains_pattern(domain_bytes, b"microsoft") ||
            contains_pattern(domain_bytes, b"meta") ||
            contains_pattern(domain_bytes, b"tesla")) {
            score = 100; // Maximum traffic for major brands
        }
        // High-traffic generic terms
        else if (contains_pattern(domain_bytes, b"chat") ||
                 contains_pattern(domain_bytes, b"news") ||
                 contains_pattern(domain_bytes, b"game") ||
                 contains_pattern(domain_bytes, b"video") ||
                 contains_pattern(domain_bytes, b"music") ||
                 contains_pattern(domain_bytes, b"social")) {
            score = score + 40; // High traffic potential
        }
        // E-commerce terms
        else if (contains_pattern(domain_bytes, b"shop") ||
                 contains_pattern(domain_bytes, b"store") ||
                 contains_pattern(domain_bytes, b"buy") ||
                 contains_pattern(domain_bytes, b"sell") ||
                 contains_pattern(domain_bytes, b"market")) {
            score = score + 35; // Good traffic potential
        };
        
        // Ensure score doesn't exceed 100
        if (score > 100) score = 100;
        
        score
    }

    /// Calculate brandability score based on domain characteristics
    fun calculate_brandability_score(domain_name: &String, domain_bytes: &vector<u8>): u64 {
        let score = 45; // Base score
        let domain_length = string::length(domain_name);
        
        // Length factor for brandability (sweet spot is 6-12 characters)
        if (domain_length >= 6 && domain_length <= 12) {
            score = score + 25;
        } else if (domain_length >= 4 && domain_length <= 15) {
            score = score + 15;
        };
        
        // Check for vowel/consonant balance (more brandable)
        let vowel_count = count_vowels(domain_bytes);
        let consonant_count = domain_length - vowel_count;
        
        if (vowel_count > 0 && consonant_count > 0) {
            let vowel_ratio = (vowel_count * 100) / domain_length;
            if (vowel_ratio >= 20 && vowel_ratio <= 60) {
                score = score + 20;
            };
        };
        
        // Avoid numbers and hyphens for better brandability
        if (!contains_numbers_or_hyphens(domain_bytes)) {
            score = score + 10;
        };
        
        // Ensure score doesn't exceed 100
        if (score > 100) score = 100;
        
        score
    }

    /// Calculate TLD rarity score based on top-level domain
    fun calculate_tld_rarity_score(domain_name: &String): u64 {
        let domain_bytes = string::bytes(domain_name);
        let domain_length = vector::length(domain_bytes);
        
        // Find the last dot to identify TLD
        let last_dot_index = 0;
        let found_dot = false;
        let i = domain_length;
        
        while (i > 0) {
            i = i - 1;
            if (*vector::borrow(domain_bytes, i) == 46) { // ASCII for '.'
                last_dot_index = i;
                found_dot = true;
                break
            };
        };
        
        if (!found_dot) {
            return 20 // No TLD found, low score
        };
        
        // Extract TLD
        let tld_start = last_dot_index + 1;
        let tld_length = domain_length - tld_start;
        
        // Score based on TLD rarity and desirability
        if (tld_length == 3) {
            // Check for .com
            if (tld_start + 2 < domain_length &&
                *vector::borrow(domain_bytes, tld_start) == 99 &&     // 'c'
                *vector::borrow(domain_bytes, tld_start + 1) == 111 && // 'o'
                *vector::borrow(domain_bytes, tld_start + 2) == 109) { // 'm'
                return 90 // .com is highly valuable
            };
            
            // Check for .org
            if (tld_start + 2 < domain_length &&
                *vector::borrow(domain_bytes, tld_start) == 111 &&     // 'o'
                *vector::borrow(domain_bytes, tld_start + 1) == 114 && // 'r'
                *vector::borrow(domain_bytes, tld_start + 2) == 103) { // 'g'
                return 75 // .org is valuable
            };
            
            // Check for .net
            if (tld_start + 2 < domain_length &&
                *vector::borrow(domain_bytes, tld_start) == 110 &&     // 'n'
                *vector::borrow(domain_bytes, tld_start + 1) == 101 && // 'e'
                *vector::borrow(domain_bytes, tld_start + 2) == 116) { // 't'
                return 70 // .net is valuable
            };
            
            return 50 // Other 3-letter TLDs
        } else if (tld_length == 2) {
            return 60 // Country code TLDs
        } else {
            return 30 // Longer TLDs are generally less valuable
        }
    }

    /// Calculate overall score as weighted average of individual scores
    fun calculate_overall_score(
        seo_authority: u64,
        traffic_estimate: u64,
        brandability: u64,
        tld_rarity: u64
    ): u64 {
        // Weighted scoring: SEO (25%), Traffic (30%), Brandability (25%), TLD (20%)
        let weighted_score = (seo_authority * 25 + 
                             traffic_estimate * 30 + 
                             brandability * 25 + 
                             tld_rarity * 20) / 100;
        
        // Scale to 0-1000 range
        (weighted_score * 10)
    }

    /// Calculate market value based on overall score and domain characteristics
    fun calculate_market_value(overall_score: u64, domain_length: u64): u64 {
        // Much higher base value for realistic pricing (1000 APT = 10^12 octas)
        let base_value = 1000000000000; // 1000 APT base value
        
        // Score multiplier (score 0-1000 maps to multiplier 1-500) - Much higher multiplier!
        let score_multiplier = 1 + (overall_score * 499) / 1000;
        
        // Length bonus for premium domains - Much higher multipliers
        let length_multiplier = if (domain_length <= 3) {
            1000  // Ultra premium for 1-3 chars (like x.com, ai.com)
        } else if (domain_length <= 5) {
            500   // Super premium for 4-5 chars (like chat.com, shop.com)
        } else if (domain_length <= 8) {
            200   // Premium for 6-8 chars (like google.com, amazon.com)
        } else if (domain_length <= 12) {
            50    // Good for 9-12 chars
        } else {
            10    // Basic for longer domains
        };
        
        base_value * score_multiplier * length_multiplier
    }

    /// Helper function to check if domain contains a specific pattern
    fun contains_pattern(domain_bytes: &vector<u8>, pattern: vector<u8>): bool {
        let domain_len = vector::length(domain_bytes);
        let pattern_len = vector::length(&pattern);
        
        if (pattern_len > domain_len) return false;
        
        let i = 0;
        while (i <= domain_len - pattern_len) {
            let match_found = true;
            let j = 0;
            
            while (j < pattern_len) {
                if (*vector::borrow(domain_bytes, i + j) != *vector::borrow(&pattern, j)) {
                    match_found = false;
                    break
                };
                j = j + 1;
            };
            
            if (match_found) return true;
            i = i + 1;
        };
        
        false
    }

    /// Helper function to count vowels in domain name
    fun count_vowels(domain_bytes: &vector<u8>): u64 {
        let vowel_count = 0;
        let len = vector::length(domain_bytes);
        let i = 0;
        
        while (i < len) {
            let byte = *vector::borrow(domain_bytes, i);
            // Check for vowels (a, e, i, o, u) in lowercase
            if (byte == 97 || byte == 101 || byte == 105 || byte == 111 || byte == 117) {
                vowel_count = vowel_count + 1;
            };
            i = i + 1;
        };
        
        vowel_count
    }

    /// Helper function to check if domain contains numbers or hyphens
    fun contains_numbers_or_hyphens(domain_bytes: &vector<u8>): bool {
        let len = vector::length(domain_bytes);
        let i = 0;
        
        while (i < len) {
            let byte = *vector::borrow(domain_bytes, i);
            // Check for numbers (0-9) or hyphen (-)
            if ((byte >= 48 && byte <= 57) || byte == 45) {
                return true
            };
            i = i + 1;
        };
        
        false
    }

    // ================================
    // Valuation Update and Consensus Functions
    // ================================

    /// Submit a valuation update proposal (oracle only)
    public fun submit_valuation_update(
        oracle: &signer,
        domain_obj: Object<DomainAsset>,
        new_valuation: ValuationData
    ) acquires ValuationOracle, PendingValuation, ValuationHistory {
        let oracle_addr = signer::address_of(oracle);
        
        // Ensure oracle system is initialized and not paused
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        
        // Perform all checks first
        {
            let oracle_system = borrow_global<ValuationOracle>(@orbiter);
            assert!(!oracle_system.paused, ESYSTEM_PAUSED);
            assert!(vector::contains(&oracle_system.authorized_oracles, &oracle_addr), EORACLE_NOT_AUTHORIZED);
        };
        
        // Validate valuation data
        assert!(validate_valuation_data(&new_valuation), EINVALID_VALUATION_DATA);
        
        // Check if enough time has passed since last update
        assert!(can_update_valuation(domain_obj), EVALUATION_UPDATE_TOO_FREQUENT);
        
        let domain_addr = object::object_address(&domain_obj);
        
        // Check if there's already a pending valuation for this domain
        assert!(!exists<PendingValuation>(domain_addr), EPENDING_VALUATION_EXISTS);
        
        // Get valuation ID and increment counter
        let (valuation_id, min_consensus) = {
            let oracle_system = borrow_global_mut<ValuationOracle>(@orbiter);
            let valuation_id = oracle_system.next_valuation_id;
            oracle_system.next_valuation_id = oracle_system.next_valuation_id + 1;
            (valuation_id, oracle_system.min_consensus)
        };
        
        let current_time = timestamp::now_seconds();
        let expires_at = current_time + 86400; // 24 hours to reach consensus
        
        // Create pending valuation
        let voted_oracles = vector::empty<address>();
        vector::push_back(&mut voted_oracles, oracle_addr);
        
        let pending_valuation = PendingValuation {
            domain_object: domain_obj,
            proposed_valuation: new_valuation,
            voted_oracles,
            votes_count: 1,
            expires_at,
            created_at: current_time,
            valuation_id,
            initiator: oracle_addr,
        };
        
        // Move to domain object address for easy lookup
        move_to(oracle, pending_valuation);
        
        // Get domain name for event
        let (domain_name, _, _) = domain_registry::get_domain_info(domain_obj);
        
        // Emit valuation update proposed event
        event::emit(ValuationUpdateProposed {
            domain_object: domain_addr,
            domain_name,
            oracle: oracle_addr,
            proposed_valuation: new_valuation,
            valuation_id,
            expires_at,
            timestamp: current_time,
        });
        
        // Check if we already have consensus (in case min_consensus is 1)
        if (min_consensus == 1) {
            apply_valuation_consensus(domain_obj);
        };
    }

    /// Vote on a pending valuation update (oracle only)
    public fun vote_on_valuation(
        oracle: &signer,
        domain_obj: Object<DomainAsset>
    ) acquires ValuationOracle, PendingValuation, ValuationHistory {
        let oracle_addr = signer::address_of(oracle);
        
        // Ensure oracle system is initialized and not paused
        assert!(exists<ValuationOracle>(@orbiter), EVALUATION_ORACLE_NOT_INITIALIZED);
        
        // Perform checks first
        let min_consensus = {
            let oracle_system = borrow_global<ValuationOracle>(@orbiter);
            assert!(!oracle_system.paused, ESYSTEM_PAUSED);
            assert!(vector::contains(&oracle_system.authorized_oracles, &oracle_addr), EORACLE_NOT_AUTHORIZED);
            oracle_system.min_consensus
        };
        
        let domain_addr = object::object_address(&domain_obj);
        
        // Ensure pending valuation exists
        assert!(exists<PendingValuation>(domain_addr), EPENDING_VALUATION_NOT_FOUND);
        
        let pending_valuation = borrow_global_mut<PendingValuation>(domain_addr);
        
        // Check if valuation has expired
        let current_time = timestamp::now_seconds();
        assert!(current_time <= pending_valuation.expires_at, EVALUATION_EXPIRED);
        
        // Check if oracle has already voted
        assert!(!vector::contains(&pending_valuation.voted_oracles, &oracle_addr), EORACLE_ALREADY_VOTED);
        
        // Record the vote
        vector::push_back(&mut pending_valuation.voted_oracles, oracle_addr);
        pending_valuation.votes_count = pending_valuation.votes_count + 1;
        
        let valuation_id = pending_valuation.valuation_id;
        let current_votes = pending_valuation.votes_count;
        
        // Emit vote cast event
        event::emit(ValuationVoteCast {
            domain_object: domain_addr,
            oracle: oracle_addr,
            valuation_id,
            current_votes,
            required_votes: min_consensus,
            timestamp: current_time,
        });
        
        // Check if consensus is reached
        if (current_votes >= min_consensus) {
            apply_valuation_consensus(domain_obj);
        };
    }

    /// Apply valuation consensus and update domain valuation
    fun apply_valuation_consensus(domain_obj: Object<DomainAsset>) acquires ValuationOracle, PendingValuation, ValuationHistory {
        let domain_addr = object::object_address(&domain_obj);
        
        // Ensure pending valuation exists
        assert!(exists<PendingValuation>(domain_addr), EPENDING_VALUATION_NOT_FOUND);
        
        let oracle_system = borrow_global_mut<ValuationOracle>(@orbiter);
        
        // Get pending valuation data before moving it
        let pending_valuation = move_from<PendingValuation>(domain_addr);
        let new_valuation = pending_valuation.proposed_valuation;
        let valuation_id = pending_valuation.valuation_id;
        let consensus_count = pending_valuation.votes_count;
        
        // Get current valuation for event
        let old_valuation = domain_registry::get_domain_valuation(domain_obj);
        
        // Update the domain valuation through domain registry
        // Note: This requires admin access, so we'll need to modify domain_registry
        // For now, we'll emit the event and track the consensus
        
        // Update oracle system statistics
        oracle_system.total_valuations = oracle_system.total_valuations + 1;
        
        // Add to valuation history
        add_to_valuation_history(domain_obj, new_valuation, valuation_id, consensus_count);
        
        // Get domain name for event
        let (domain_name, _, _) = domain_registry::get_domain_info(domain_obj);
        
        // Emit consensus reached event
        event::emit(ValuationConsensusReached {
            domain_object: domain_addr,
            domain_name,
            old_valuation,
            new_valuation,
            valuation_id,
            consensus_count,
            timestamp: timestamp::now_seconds(),
        });
        
        // Pending valuation cleaned up automatically with drop ability
        // For now, we'll let the resource cleanup handle it
    }

    /// Add valuation to historical records
    fun add_to_valuation_history(
        domain_obj: Object<DomainAsset>,
        valuation: ValuationData,
        valuation_id: u64,
        consensus_count: u64
    ) acquires ValuationHistory {
        let domain_addr = object::object_address(&domain_obj);
        let current_time = timestamp::now_seconds();
        
        // Create historical entry
        let historical_entry = HistoricalValuation {
            valuation,
            timestamp: current_time,
            valuation_id,
            consensus_count,
        };
        
        // Add to history or create new history
        if (exists<ValuationHistory>(domain_addr)) {
            let history = borrow_global_mut<ValuationHistory>(domain_addr);
            vector::push_back(&mut history.valuations, historical_entry);
            history.last_updated = current_time;
            
            // Keep only last 50 valuations to prevent unbounded growth
            let history_len = vector::length(&history.valuations);
            if (history_len > 50) {
                vector::remove(&mut history.valuations, 0);
            };
        } else {
            // Create new history - this requires a signer, so we'll skip for now
            // In a full implementation, this would need proper resource management
        };
    }

    /// Clean up expired pending valuations (anyone can call)
    public fun cleanup_expired_valuation(domain_obj: Object<DomainAsset>) acquires PendingValuation {
        let domain_addr = object::object_address(&domain_obj);
        
        if (exists<PendingValuation>(domain_addr)) {
            let pending_valuation = borrow_global<PendingValuation>(domain_addr);
            let current_time = timestamp::now_seconds();
            
            if (current_time > pending_valuation.expires_at) {
                // Remove expired pending valuation
                let _expired_valuation = move_from<PendingValuation>(domain_addr);
                // Expired valuation cleaned up automatically with drop
            };
        };
    }

    // ================================
    // Valuation Query Functions
    // ================================

    /// Get current valuation for a domain
    public fun get_current_valuation(domain_obj: Object<DomainAsset>): ValuationData {
        domain_registry::get_domain_valuation(domain_obj)
    }

    /// Get pending valuation details if one exists
    public fun get_pending_valuation(domain_obj: Object<DomainAsset>): (
        bool,           // has_pending
        ValuationData,  // proposed_valuation
        u64,            // votes_count
        u64,            // expires_at
        u64,            // valuation_id
        address         // initiator
    ) acquires PendingValuation {
        let domain_addr = object::object_address(&domain_obj);
        
        if (!exists<PendingValuation>(domain_addr)) {
            return (
                false,
                domain_registry::new_valuation_data(0, 0, 0, 0, 0, 0, 0),
                0,
                0,
                0,
                @0x0
            )
        };
        
        let pending_valuation = borrow_global<PendingValuation>(domain_addr);
        (
            true,
            pending_valuation.proposed_valuation,
            pending_valuation.votes_count,
            pending_valuation.expires_at,
            pending_valuation.valuation_id,
            pending_valuation.initiator
        )
    }

    /// Check if a pending valuation exists for a domain
    public fun has_pending_valuation(domain_obj: Object<DomainAsset>): bool {
        let domain_addr = object::object_address(&domain_obj);
        exists<PendingValuation>(domain_addr)
    }

    /// Check if a pending valuation has expired
    public fun is_pending_valuation_expired(domain_obj: Object<DomainAsset>): bool acquires PendingValuation {
        let domain_addr = object::object_address(&domain_obj);
        
        if (!exists<PendingValuation>(domain_addr)) {
            return false
        };
        
        let pending_valuation = borrow_global<PendingValuation>(domain_addr);
        let current_time = timestamp::now_seconds();
        
        current_time > pending_valuation.expires_at
    }

    /// Get valuation history for a domain
    public fun get_valuation_history(domain_obj: Object<DomainAsset>): (
        bool,                           // has_history
        vector<HistoricalValuation>,    // historical_valuations
        u64                             // last_updated
    ) acquires ValuationHistory {
        let domain_addr = object::object_address(&domain_obj);
        
        if (!exists<ValuationHistory>(domain_addr)) {
            return (false, vector::empty<HistoricalValuation>(), 0)
        };
        
        let history = borrow_global<ValuationHistory>(domain_addr);
        (true, history.valuations, history.last_updated)
    }

    /// Get the number of historical valuations for a domain
    public fun get_valuation_history_count(domain_obj: Object<DomainAsset>): u64 acquires ValuationHistory {
        let domain_addr = object::object_address(&domain_obj);
        
        if (!exists<ValuationHistory>(domain_addr)) {
            return 0
        };
        
        let history = borrow_global<ValuationHistory>(domain_addr);
        vector::length(&history.valuations)
    }

    /// Get the latest historical valuation (most recent consensus)
    public fun get_latest_consensus_valuation(domain_obj: Object<DomainAsset>): (
        bool,                       // has_history
        HistoricalValuation         // latest_valuation
    ) acquires ValuationHistory {
        let domain_addr = object::object_address(&domain_obj);
        
        if (!exists<ValuationHistory>(domain_addr)) {
            return (
                false,
                HistoricalValuation {
                    valuation: domain_registry::new_valuation_data(0, 0, 0, 0, 0, 0, 0),
                    timestamp: 0,
                    valuation_id: 0,
                    consensus_count: 0,
                }
            )
        };
        
        let history = borrow_global<ValuationHistory>(domain_addr);
        let history_len = vector::length(&history.valuations);
        
        if (history_len == 0) {
            return (
                false,
                HistoricalValuation {
                    valuation: domain_registry::new_valuation_data(0, 0, 0, 0, 0, 0, 0),
                    timestamp: 0,
                    valuation_id: 0,
                    consensus_count: 0,
                }
            )
        };
        
        let latest = *vector::borrow(&history.valuations, history_len - 1);
        (true, latest)
    }

    /// Check if an oracle has voted on a pending valuation
    public fun has_oracle_voted(
        domain_obj: Object<DomainAsset>,
        oracle_addr: address
    ): bool acquires PendingValuation {
        let domain_addr = object::object_address(&domain_obj);
        
        if (!exists<PendingValuation>(domain_addr)) {
            return false
        };
        
        let pending_valuation = borrow_global<PendingValuation>(domain_addr);
        vector::contains(&pending_valuation.voted_oracles, &oracle_addr)
    }

    /// Get time until next allowed valuation update
    public fun get_time_until_next_update(domain_obj: Object<DomainAsset>): u64 acquires ValuationOracle {
        if (!exists<ValuationOracle>(@orbiter)) {
            return 0
        };
        
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        let current_valuation = domain_registry::get_domain_valuation(domain_obj);
        let current_time = timestamp::now_seconds();
        
        let time_since_update = current_time - domain_registry::get_valuation_updated_at(&current_valuation);
        
        if (time_since_update >= oracle_system.update_frequency) {
            return 0 // Can update now
        } else {
            return oracle_system.update_frequency - time_since_update
        }
    }

    /// Get comprehensive valuation status for a domain
    public fun get_valuation_status(domain_obj: Object<DomainAsset>): (
        ValuationData,  // current_valuation
        bool,           // has_pending
        bool,           // can_update_now
        u64,            // time_until_next_update
        u64             // history_count
    ) acquires ValuationOracle, ValuationHistory {
        let current_valuation = get_current_valuation(domain_obj);
        let has_pending = has_pending_valuation(domain_obj);
        let can_update_now = can_domain_be_updated(domain_obj);
        let time_until_next = get_time_until_next_update(domain_obj);
        let history_count = get_valuation_history_count(domain_obj);
        
        (current_valuation, has_pending, can_update_now, time_until_next, history_count)
    }

    // ================================
    // Valuation Data Export Functions for Frontend
    // ================================

    /// Export valuation data in a frontend-friendly format
    public fun export_valuation_data(domain_obj: Object<DomainAsset>): (
        u64,    // overall_score
        u64,    // market_value_apt (converted from octas)
        u64,    // seo_authority
        u64,    // traffic_estimate
        u64,    // brandability
        u64,    // tld_rarity
        u64,    // last_updated
        String  // formatted_market_value
    ) {
        let valuation = get_current_valuation(domain_obj);
        
        // Convert market value from octas to APT (divide by 10^8)
        let market_value_apt = domain_registry::get_valuation_market_value(&valuation) / 100000000;
        
        // Create formatted market value string (simplified)
        let formatted_value = if (market_value_apt >= 1000000) {
            string::utf8(b"1M+ APT")
        } else if (market_value_apt >= 1000) {
            string::utf8(b"1K+ APT")
        } else if (market_value_apt >= 1) {
            string::utf8(b"1+ APT")
        } else {
            string::utf8(b"<1 APT")
        };
        
        (
            domain_registry::get_valuation_score(&valuation),
            market_value_apt,
            domain_registry::get_valuation_seo_authority(&valuation),
            domain_registry::get_valuation_traffic_estimate(&valuation),
            domain_registry::get_valuation_brandability(&valuation),
            domain_registry::get_valuation_tld_rarity(&valuation),
            domain_registry::get_valuation_updated_at(&valuation),
            formatted_value
        )
    }

    /// Export pending valuation data for frontend
    public fun export_pending_valuation_data(domain_obj: Object<DomainAsset>): (
        bool,   // has_pending
        u64,    // votes_received
        u64,    // votes_required
        u64,    // time_remaining
        u64,    // proposed_score
        u64     // proposed_market_value_apt
    ) acquires ValuationOracle, PendingValuation {
        let (has_pending, proposed_valuation, votes_count, expires_at, _, _) = get_pending_valuation(domain_obj);
        
        if (!has_pending) {
            return (false, 0, 0, 0, 0, 0)
        };
        
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        let current_time = timestamp::now_seconds();
        let time_remaining = if (current_time < expires_at) {
            expires_at - current_time
        } else {
            0
        };
        
        let proposed_market_value_apt = domain_registry::get_valuation_market_value(&proposed_valuation) / 100000000;
        
        (
            true,
            votes_count,
            oracle_system.min_consensus,
            time_remaining,
            domain_registry::get_valuation_score(&proposed_valuation),
            proposed_market_value_apt
        )
    }

    /// Export oracle system status for frontend
    public fun export_oracle_system_status(): (
        bool,           // is_initialized
        bool,           // is_paused
        u64,            // total_oracles
        u64,            // min_consensus
        u64,            // update_frequency_hours
        u64,            // total_valuations
        address         // admin
    ) acquires ValuationOracle {
        if (!exists<ValuationOracle>(@orbiter)) {
            return (false, true, 0, 0, 0, 0, @0x0)
        };
        
        let oracle_system = borrow_global<ValuationOracle>(@orbiter);
        let update_frequency_hours = oracle_system.update_frequency / 3600; // Convert seconds to hours
        
        (
            true,
            oracle_system.paused,
            vector::length(&oracle_system.authorized_oracles),
            oracle_system.min_consensus,
            update_frequency_hours,
            oracle_system.total_valuations,
            oracle_system.admin
        )
    }

    // ================================
    // Helper Functions for Valuation Calculations
    // ================================

    /// Recalculate valuation for a domain with updated parameters
    public fun recalculate_domain_valuation(
        domain_obj: Object<DomainAsset>,
        seo_weight: u64,
        traffic_weight: u64,
        brand_weight: u64,
        tld_weight: u64
    ): ValuationData {
        let current_valuation = get_current_valuation(domain_obj);
        let (domain_name, _, _) = domain_registry::get_domain_info(domain_obj);
        
        // Ensure weights sum to 100
        let total_weight = seo_weight + traffic_weight + brand_weight + tld_weight;
        assert!(total_weight == 100, EINVALID_VALUATION_DATA);
        
        // Calculate new overall score with custom weights
        let weighted_score = (domain_registry::get_valuation_seo_authority(&current_valuation) * seo_weight + 
                             domain_registry::get_valuation_traffic_estimate(&current_valuation) * traffic_weight + 
                             domain_registry::get_valuation_brandability(&current_valuation) * brand_weight + 
                             domain_registry::get_valuation_tld_rarity(&current_valuation) * tld_weight) / 100;
        
        // Scale to 0-1000 range
        let new_overall_score = weighted_score * 10;
        
        // Recalculate market value
        let domain_length = string::length(&domain_name);
        let new_market_value = calculate_market_value(new_overall_score, domain_length);
        
        domain_registry::new_valuation_data(
            new_overall_score,
            new_market_value,
            domain_registry::get_valuation_seo_authority(&current_valuation),
            domain_registry::get_valuation_traffic_estimate(&current_valuation),
            domain_registry::get_valuation_brandability(&current_valuation),
            domain_registry::get_valuation_tld_rarity(&current_valuation),
            timestamp::now_seconds()
        )
    }

    /// Compare two valuations and return the difference
    public fun compare_valuations(
        valuation1: ValuationData,
        valuation2: ValuationData
    ): (
        bool,   // valuation1_higher
        u64,    // score_difference
        u64,    // market_value_difference_apt
        u64     // percentage_change (basis points)
    ) {
        let val1_score = domain_registry::get_valuation_score(&valuation1);
        let val2_score = domain_registry::get_valuation_score(&valuation2);
        let val1_market = domain_registry::get_valuation_market_value(&valuation1);
        let val2_market = domain_registry::get_valuation_market_value(&valuation2);
        
        let score_diff = if (val1_score >= val2_score) {
            val1_score - val2_score
        } else {
            val2_score - val1_score
        };
        
        let val1_higher = val1_score >= val2_score;
        
        let market_diff_octas = if (val1_market >= val2_market) {
            val1_market - val2_market
        } else {
            val2_market - val1_market
        };
        
        let market_diff_apt = market_diff_octas / 100000000;
        
        // Calculate percentage change in basis points (1% = 100 bp)
        let percentage_change = if (val2_market > 0) {
            (market_diff_octas * 10000) / val2_market
        } else {
            0
        };
        
        (val1_higher, score_diff, market_diff_apt, percentage_change)
    }

    /// Get valuation trend analysis
    public fun get_valuation_trend(domain_obj: Object<DomainAsset>): (
        bool,   // has_trend_data
        bool,   // is_increasing
        u64,    // trend_percentage (basis points)
        u64     // trend_period_days
    ) acquires ValuationHistory {
        let (has_history, valuations, _) = get_valuation_history(domain_obj);
        
        if (!has_history) {
            return (false, false, 0, 0)
        };
        
        let history_len = vector::length(&valuations);
        if (history_len < 2) {
            return (false, false, 0, 0)
        };
        
        // Compare latest with previous valuation
        let latest = *vector::borrow(&valuations, history_len - 1);
        let previous = *vector::borrow(&valuations, history_len - 2);
        
        let (is_increasing, _, _, percentage_change) = compare_valuations(
            latest.valuation,
            previous.valuation
        );
        
        // Calculate trend period in days
        let time_diff = latest.timestamp - previous.timestamp;
        let trend_period_days = time_diff / 86400; // Convert seconds to days
        
        (true, is_increasing, percentage_change, trend_period_days)
    }
}