module orbiter::domain_registry {
    use std::string::String;
    use std::option::{Self, Option};
    use std::signer;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    // ================================
    // Error Codes
    // ================================
    
    /// Domain-related errors
    const EDOMAIN_ALREADY_EXISTS: u64 = 1;
    const EDOMAIN_NOT_FOUND: u64 = 2;
    const EINVALID_VERIFICATION: u64 = 3;
    const EUNAUTHORIZED_OWNER: u64 = 4;
    const EINVALID_DOMAIN_NAME: u64 = 5;
    const EEMPTY_VERIFICATION_HASH: u64 = 6;
    
    /// System errors
    const ESYSTEM_PAUSED: u64 = 30;
    const EUNAUTHORIZED_ADMIN: u64 = 31;
    const EREGISTRY_NOT_INITIALIZED: u64 = 32;
    const EREGISTRY_ALREADY_INITIALIZED: u64 = 33;

    // ================================
    // Data Structures
    // ================================

    /// Valuation metrics for the domain
    struct ValuationData has store, copy, drop {
        /// Overall valuation score (0-1000)
        score: u64,
        /// Estimated market value in APT (in octas)
        market_value: u64,
        /// SEO authority score (0-100)
        seo_authority: u64,
        /// Traffic estimate score (0-100)
        traffic_estimate: u64,
        /// Brandability score (0-100)
        brandability: u64,
        /// TLD rarity score (0-100)
        tld_rarity: u64,
        /// Last updated timestamp
        updated_at: u64,
    }

    /// Configuration for fractional ownership
    struct FractionalConfig has store, copy, drop {
        /// Token ticker symbol (e.g., "GOOGL")
        ticker: String,
        /// Total supply of shares
        total_supply: u64,
        /// Shares currently in circulation
        circulating_supply: u64,
        /// Whether fractional trading is enabled
        trading_enabled: bool,
    }

    /// Core domain asset represented as an Aptos Object
    struct DomainAsset has key {
        /// The domain name (e.g., "example.com")
        domain_name: String,
        /// Original owner who tokenized the domain
        original_owner: address,
        /// DNS verification proof hash
        verification_hash: String,
        /// Timestamp when domain was tokenized
        created_at: u64,
        /// Current valuation data
        valuation: ValuationData,
        /// Fractional ownership configuration
        fractional_config: Option<FractionalConfig>,
    }

    /// Global registry tracking all domains
    struct DomainRegistry has key {
        /// Total number of domains tokenized
        total_domains: u64,
        /// Mapping of domain names to object addresses
        domain_objects: Table<String, address>,
        /// Admin address for privileged operations
        admin: address,
        /// Whether the registry is paused
        paused: bool,
    }

    // ================================
    // Events
    // ================================

    #[event]
    /// Event emitted when a domain is tokenized
    struct DomainTokenized has store, drop {
        /// The domain object address
        domain_object: address,
        /// The domain name
        domain_name: String,
        /// Owner address
        owner: address,
        /// Verification hash used
        verification_hash: String,
        /// Initial valuation
        valuation: ValuationData,
        /// Fractional config if enabled
        fractional_config: Option<FractionalConfig>,
        /// Timestamp of tokenization
        timestamp: u64,
    }

    #[event]
    /// Event emitted when domain ownership is transferred
    struct OwnershipTransferred has store, drop {
        /// The domain object address
        domain_object: address,
        /// The domain name
        domain_name: String,
        /// Previous owner
        from_owner: address,
        /// New owner
        to_owner: address,
        /// Timestamp of transfer
        timestamp: u64,
    }

    #[event]
    /// Event emitted when valuation is updated
    struct ValuationUpdated has store, drop {
        /// The domain object address
        domain_object: address,
        /// The domain name
        domain_name: String,
        /// Previous valuation
        old_valuation: ValuationData,
        /// New valuation
        new_valuation: ValuationData,
        /// Timestamp of update
        timestamp: u64,
    }

    // ================================
    // Helper Functions
    // ================================

    /// Create a new ValuationData struct
    public fun new_valuation_data(
        score: u64,
        market_value: u64,
        seo_authority: u64,
        traffic_estimate: u64,
        brandability: u64,
        tld_rarity: u64,
        updated_at: u64,
    ): ValuationData {
        ValuationData {
            score,
            market_value,
            seo_authority,
            traffic_estimate,
            brandability,
            tld_rarity,
            updated_at,
        }
    }

    /// Create a new FractionalConfig struct
    public fun new_fractional_config(
        ticker: String,
        total_supply: u64,
        trading_enabled: bool,
    ): FractionalConfig {
        FractionalConfig {
            ticker,
            total_supply,
            circulating_supply: total_supply, // Initially all shares are with the owner
            trading_enabled,
        }
    }

    // ================================
    // Domain Object Creation Functions
    // ================================

    /// Validate domain name format and requirements
    fun validate_domain_name(domain_name: &String): bool {
        use std::string;
        let length = string::length(domain_name);
        length >= 3 && length <= 253
    }

    /// Validate verification hash format
    fun validate_verification_hash(verification_hash: &String): bool {
        use std::string;
        let length = string::length(verification_hash);
        length >= 32 && length <= 128
    }

    /// Create a new domain object with verification
    public fun create_domain_object(
        creator: &signer,
        domain_name: String,
        verification_hash: String,
        valuation: ValuationData,
        fractional_config: Option<FractionalConfig>
    ): Object<DomainAsset> acquires DomainRegistry {
        use aptos_framework::timestamp;
        use std::string;
        
        let creator_addr = signer::address_of(creator);
        
        // Basic input validation
        assert!(creator_addr != @0x0, EUNAUTHORIZED_OWNER);
        assert!(string::length(&domain_name) >= 3, EINVALID_DOMAIN_NAME);
        assert!(string::length(&domain_name) <= 253, EINVALID_DOMAIN_NAME);
        assert!(string::length(&verification_hash) >= 32, EEMPTY_VERIFICATION_HASH);
        assert!(valuation.score <= 1000, EINVALID_DOMAIN_NAME);
        
        // Validate fractional config if provided
        if (option::is_some(&fractional_config)) {
            let config = option::borrow(&fractional_config);
            assert!(config.total_supply > 0, EINVALID_DOMAIN_NAME);
            assert!(config.circulating_supply <= config.total_supply, EINVALID_DOMAIN_NAME);
            assert!(string::length(&config.ticker) > 0, EINVALID_DOMAIN_NAME);
        };
        
        // Check if registry exists and is not paused
        assert!(exists<DomainRegistry>(@orbiter), EREGISTRY_NOT_INITIALIZED);
        let registry = borrow_global_mut<DomainRegistry>(@orbiter);
        assert!(!registry.paused, ESYSTEM_PAUSED);
        
        // Check for duplicate domain
        assert!(!table::contains(&registry.domain_objects, domain_name), EDOMAIN_ALREADY_EXISTS);
        
        // Create the domain object
        let constructor_ref = object::create_object(creator_addr);
        let object_signer = object::generate_signer(&constructor_ref);
        let object_addr = signer::address_of(&object_signer);
        
        let current_time = timestamp::now_seconds();
        
        // Create the DomainAsset resource
        let domain_asset = DomainAsset {
            domain_name: domain_name,
            original_owner: creator_addr,
            verification_hash: verification_hash,
            created_at: current_time,
            valuation: valuation,
            fractional_config: fractional_config,
        };
        
        // Move the resource to the object
        move_to(&object_signer, domain_asset);
        
        // Update registry
        table::add(&mut registry.domain_objects, domain_name, object_addr);
        registry.total_domains = registry.total_domains + 1;
        
        // Get the object reference
        let domain_object = object::object_from_constructor_ref<DomainAsset>(&constructor_ref);
        
        // Emit tokenization event
        event::emit(DomainTokenized {
            domain_object: object_addr,
            domain_name: domain_name,
            owner: creator_addr,
            verification_hash: verification_hash,
            valuation: valuation,
            fractional_config: fractional_config,
            timestamp: current_time,
        });
        
        domain_object
    }

    /// Entry wrapper for frontend wallets: accepts primitive fields instead of structs
    public entry fun create_domain_object_entry(
        creator: &signer,
        domain_name: String,
        verification_hash: String,
        score: u64,
        market_value: u64,
        seo_authority: u64,
        traffic_estimate: u64,
        brandability: u64,
        tld_rarity: u64,
        enable_fractional: bool,
        ticker: String,
        total_supply: u64,
        circulating_supply: u64,
        trading_enabled: bool
    ) acquires DomainRegistry {
        let valuation = ValuationData {
            score,
            market_value,
            seo_authority,
            traffic_estimate,
            brandability,
            tld_rarity,
            updated_at: 0,
        };

        let fractional_config = if (enable_fractional) {
            option::some(FractionalConfig {
                ticker,
                total_supply,
                circulating_supply,
                trading_enabled,
            })
        } else {
            // consume strings to avoid unused warnings when not enabled
            let _ = ticker;
            option::none<FractionalConfig>()
        };

        let _obj = create_domain_object(
            creator,
            domain_name,
            verification_hash,
            valuation,
            fractional_config
        );
    }

    /// Verify DNS ownership through hash validation
    /// This is a simplified version - in production, this would integrate with DNS verification service
    public fun verify_dns_ownership(
        _domain_name: String,
        verification_hash: String,
        expected_challenge: String
    ): bool {
        use std::string;
        
        // In a real implementation, this would:
        // 1. Query DNS TXT records for the domain
        // 2. Look for a record containing the expected_challenge
        // 3. Validate the verification_hash matches the challenge
        
        // For now, we do basic validation that the hash is properly formatted
        validate_verification_hash(&verification_hash) && 
        string::length(&expected_challenge) > 0
    }

    // ================================
    // Domain Ownership and Transfer Functions
    // ================================

    /// Transfer domain ownership to a new address
    public fun transfer_domain(
        current_owner: &signer,
        domain_obj: Object<DomainAsset>,
        new_owner: address
    ) acquires DomainAsset {
        use aptos_framework::timestamp;
        
        let current_owner_addr = signer::address_of(current_owner);
        let domain_addr = object::object_address(&domain_obj);
        
        // Basic input validation
        assert!(current_owner_addr != @0x0, EUNAUTHORIZED_OWNER);
        assert!(new_owner != @0x0, EUNAUTHORIZED_OWNER);
        assert!(current_owner_addr != new_owner, EUNAUTHORIZED_OWNER);
        
        // Verify the domain exists
        assert!(exists<DomainAsset>(domain_addr), EDOMAIN_NOT_FOUND);
        
        // Get mutable reference to domain asset
        let domain_asset = borrow_global_mut<DomainAsset>(domain_addr);
        
        // Additional ownership verification
        assert!(object::is_owner(domain_obj, current_owner_addr), EUNAUTHORIZED_OWNER);
        
        let domain_name = domain_asset.domain_name;
        let current_time = timestamp::now_seconds();
        
        // Transfer the object ownership
        object::transfer(current_owner, domain_obj, new_owner);
        
        // Emit ownership transfer event
        event::emit(OwnershipTransferred {
            domain_object: domain_addr,
            domain_name: domain_name,
            from_owner: current_owner_addr,
            to_owner: new_owner,
            timestamp: current_time,
        });
    }

    /// Check if a domain exists by name
    public fun domain_exists(domain_name: String): bool acquires DomainRegistry {
        if (!exists<DomainRegistry>(@orbiter)) {
            return false
        };
        
        let registry = borrow_global<DomainRegistry>(@orbiter);
        table::contains(&registry.domain_objects, domain_name)
    }

    /// Get domain object address by name
    public fun get_domain_object_address(domain_name: String): address acquires DomainRegistry {
        assert!(exists<DomainRegistry>(@orbiter), EREGISTRY_NOT_INITIALIZED);
        let registry = borrow_global<DomainRegistry>(@orbiter);
        assert!(table::contains(&registry.domain_objects, domain_name), EDOMAIN_NOT_FOUND);
        
        *table::borrow(&registry.domain_objects, domain_name)
    }

    /// Get domain information
    public fun get_domain_info(domain_obj: Object<DomainAsset>): (String, address, ValuationData) acquires DomainAsset {
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<DomainAsset>(domain_addr), EDOMAIN_NOT_FOUND);
        
        let domain_asset = borrow_global<DomainAsset>(domain_addr);
        (
            domain_asset.domain_name,
            domain_asset.original_owner,
            domain_asset.valuation
        )
    }

    /// Get complete domain details
    public fun get_domain_details(domain_obj: Object<DomainAsset>): (
        String,           // domain_name
        address,          // original_owner
        String,           // verification_hash
        u64,              // created_at
        ValuationData,    // valuation
        Option<FractionalConfig>  // fractional_config
    ) acquires DomainAsset {
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<DomainAsset>(domain_addr), EDOMAIN_NOT_FOUND);
        
        let domain_asset = borrow_global<DomainAsset>(domain_addr);
        (
            domain_asset.domain_name,
            domain_asset.original_owner,
            domain_asset.verification_hash,
            domain_asset.created_at,
            domain_asset.valuation,
            domain_asset.fractional_config
        )
    }

    /// Get current owner of a domain object
    public fun get_domain_owner(domain_obj: Object<DomainAsset>): address {
        object::owner(domain_obj)
    }

    /// Check if an address owns a specific domain
    public fun is_domain_owner(domain_obj: Object<DomainAsset>, potential_owner: address): bool {
        object::is_owner(domain_obj, potential_owner)
    }

    /// Get domain valuation data
    public fun get_domain_valuation(domain_obj: Object<DomainAsset>): ValuationData acquires DomainAsset {
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<DomainAsset>(domain_addr), EDOMAIN_NOT_FOUND);
        
        let domain_asset = borrow_global<DomainAsset>(domain_addr);
        domain_asset.valuation
    }

    /// Get domain fractional configuration
    public fun get_fractional_config(domain_obj: Object<DomainAsset>): Option<FractionalConfig> acquires DomainAsset {
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<DomainAsset>(domain_addr), EDOMAIN_NOT_FOUND);
        
        let domain_asset = borrow_global<DomainAsset>(domain_addr);
        domain_asset.fractional_config
    }

    // ================================
    // Registry Management Functions
    // ================================

    /// Initialize the domain registry (called once at deployment)
    public fun initialize(admin: &signer) {
        
        let admin_addr = signer::address_of(admin);
        
        // Basic input validation
        assert!(admin_addr != @0x0, EUNAUTHORIZED_ADMIN);
        
        // Ensure registry doesn't already exist
        assert!(!exists<DomainRegistry>(admin_addr), EREGISTRY_NOT_INITIALIZED);
        
        let registry = DomainRegistry {
            total_domains: 0,
            domain_objects: table::new(),
            admin: admin_addr,
            paused: false,
        };
        
        move_to(admin, registry);
    }

    /// Entry wrapper so frontends/wallets can initialize if it was not done at publish time.
    /// Safe because it will abort if a registry already exists at the admin address.
    public entry fun initialize_entry(admin: &signer) { initialize(admin) }

    /// Pause the registry (admin only)
    public fun pause_registry(admin: &signer) acquires DomainRegistry {
        
        let admin_addr = signer::address_of(admin);
        
        // Input validation
        assert!(admin_addr != @0x0, EUNAUTHORIZED_ADMIN);
        
        assert!(exists<DomainRegistry>(@orbiter), EREGISTRY_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<DomainRegistry>(@orbiter);
        assert!(registry.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        
        registry.paused = true;
    }

    /// Unpause the registry (admin only)
    public fun unpause_registry(admin: &signer) acquires DomainRegistry {
        
        let admin_addr = signer::address_of(admin);
        
        // Input validation
        assert!(admin_addr != @0x0, EUNAUTHORIZED_ADMIN);
        
        assert!(exists<DomainRegistry>(@orbiter), EREGISTRY_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<DomainRegistry>(@orbiter);
        assert!(registry.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        
        registry.paused = false;
    }

    /// Update registry admin (current admin only)
    public fun update_admin(current_admin: &signer, new_admin: address) acquires DomainRegistry {
        
        let current_admin_addr = signer::address_of(current_admin);
        
        // Basic input validation
        assert!(current_admin_addr != @0x0, EUNAUTHORIZED_ADMIN);
        assert!(new_admin != @0x0, EUNAUTHORIZED_ADMIN);
        assert!(current_admin_addr != new_admin, EUNAUTHORIZED_ADMIN);
        
        assert!(exists<DomainRegistry>(@orbiter), EREGISTRY_NOT_INITIALIZED);
        
        let registry = borrow_global_mut<DomainRegistry>(@orbiter);
        assert!(registry.admin == current_admin_addr, EUNAUTHORIZED_ADMIN);
        
        registry.admin = new_admin;
    }

    /// Update domain valuation (admin only)
    public fun update_domain_valuation(
        admin: &signer,
        domain_obj: Object<DomainAsset>,
        new_valuation: ValuationData
    ) acquires DomainRegistry, DomainAsset {
        use aptos_framework::timestamp;
        
        let admin_addr = signer::address_of(admin);
        
        // Basic input validation
        assert!(admin_addr != @0x0, EUNAUTHORIZED_ADMIN);
        assert!(new_valuation.score <= 1000, EINVALID_DOMAIN_NAME);
        
        assert!(exists<DomainRegistry>(@orbiter), EREGISTRY_NOT_INITIALIZED);
        
        let registry = borrow_global<DomainRegistry>(@orbiter);
        
        // Access control checks
        assert!(registry.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        assert!(!registry.paused, ESYSTEM_PAUSED);
        
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<DomainAsset>(domain_addr), EDOMAIN_NOT_FOUND);
        
        let domain_asset = borrow_global_mut<DomainAsset>(domain_addr);
        let old_valuation = domain_asset.valuation;
        domain_asset.valuation = new_valuation;
        
        // Emit valuation update event
        event::emit(ValuationUpdated {
            domain_object: domain_addr,
            domain_name: domain_asset.domain_name,
            old_valuation: old_valuation,
            new_valuation: new_valuation,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Get registry statistics
    public fun get_registry_stats(): (u64, address, bool) acquires DomainRegistry {
        assert!(exists<DomainRegistry>(@orbiter), EREGISTRY_NOT_INITIALIZED);
        
        let registry = borrow_global<DomainRegistry>(@orbiter);
        (registry.total_domains, registry.admin, registry.paused)
    }

    /// Check if registry is paused
    public fun is_registry_paused(): bool acquires DomainRegistry {
        if (!exists<DomainRegistry>(@orbiter)) {
            return true
        };
        
        let registry = borrow_global<DomainRegistry>(@orbiter);
        registry.paused
    }

    /// Get registry admin address
    public fun get_registry_admin(): address acquires DomainRegistry {
        assert!(exists<DomainRegistry>(@orbiter), EREGISTRY_NOT_INITIALIZED);
        
        let registry = borrow_global<DomainRegistry>(@orbiter);
        registry.admin
    }

    /// Get total number of domains
    public fun get_total_domains(): u64 acquires DomainRegistry {
        assert!(exists<DomainRegistry>(@orbiter), EREGISTRY_NOT_INITIALIZED);
        
        let registry = borrow_global<DomainRegistry>(@orbiter);
        registry.total_domains
    }

    /// Check if trading is enabled for a domain's fractional config
    public fun is_trading_enabled(domain_obj: Object<DomainAsset>): bool acquires DomainAsset {
        let fractional_config = get_fractional_config(domain_obj);
        if (option::is_some(&fractional_config)) {
            let config = option::borrow(&fractional_config);
            config.trading_enabled
        } else {
            false
        }
    }

    /// Get ticker symbol from fractional config
    public fun get_ticker_symbol(domain_obj: Object<DomainAsset>): Option<String> acquires DomainAsset {
        let fractional_config = get_fractional_config(domain_obj);
        if (option::is_some(&fractional_config)) {
            let config = option::borrow(&fractional_config);
            option::some(config.ticker)
        } else {
            option::none()
        }
    }

    /// Get total supply from fractional config
    public fun get_fractional_total_supply(domain_obj: Object<DomainAsset>): u64 acquires DomainAsset {
        let fractional_config = get_fractional_config(domain_obj);
        if (option::is_some(&fractional_config)) {
            let config = option::borrow(&fractional_config);
            config.total_supply
        } else {
            0
        }
    }

    // ================================
    // Input Validation Functions
    // ================================

    /// Comprehensive input validation for domain creation
    public fun validate_domain_creation_inputs(
        domain_name: &String,
        verification_hash: &String,
        valuation: &ValuationData,
        fractional_config: &Option<FractionalConfig>
    ): bool {
        // Validate domain name
        if (!validate_domain_name(domain_name)) {
            return false
        };
        
        // Validate verification hash
        if (!validate_verification_hash(verification_hash)) {
            return false
        };
        
        // Validate valuation data
        if (valuation.score > 1000 || 
            valuation.seo_authority > 100 ||
            valuation.traffic_estimate > 100 ||
            valuation.brandability > 100 ||
            valuation.tld_rarity > 100) {
            return false
        };
        
        // Validate fractional config if present
        if (option::is_some(fractional_config)) {
            let config = option::borrow(fractional_config);
            if (config.total_supply == 0 || config.circulating_supply > config.total_supply) {
                return false
            };
        };
        
        true
    }

    /// Validate address is not zero
    public fun validate_address(addr: address): bool {
        addr != @0x0
    }

    /// Validate amount is positive
    public fun validate_positive_amount(amount: u64): bool {
        amount > 0
    }

    // ================================
    // ValuationData Getter Functions
    // ================================

    /// Get valuation score
    public fun get_valuation_score(valuation: &ValuationData): u64 {
        valuation.score
    }

    /// Get market value
    public fun get_valuation_market_value(valuation: &ValuationData): u64 {
        valuation.market_value
    }

    /// Get SEO authority score
    public fun get_valuation_seo_authority(valuation: &ValuationData): u64 {
        valuation.seo_authority
    }

    /// Get traffic estimate score
    public fun get_valuation_traffic_estimate(valuation: &ValuationData): u64 {
        valuation.traffic_estimate
    }

    /// Get brandability score
    public fun get_valuation_brandability(valuation: &ValuationData): u64 {
        valuation.brandability
    }

    /// Get TLD rarity score
    public fun get_valuation_tld_rarity(valuation: &ValuationData): u64 {
        valuation.tld_rarity
    }

    /// Get updated timestamp
    public fun get_valuation_updated_at(valuation: &ValuationData): u64 {
        valuation.updated_at
    }

    /// Get all valuation fields as tuple
    public fun get_valuation_fields(valuation: &ValuationData): (u64, u64, u64, u64, u64, u64, u64) {
        (
            valuation.score,
            valuation.market_value,
            valuation.seo_authority,
            valuation.traffic_estimate,
            valuation.brandability,
            valuation.tld_rarity,
            valuation.updated_at
        )
    }

    // ================================
    // FractionalConfig Getter Functions
    // ================================

    /// Get ticker from fractional config
    public fun get_fractional_config_ticker(config: &FractionalConfig): String {
        config.ticker
    }

    /// Get total supply from fractional config
    public fun get_fractional_config_total_supply(config: &FractionalConfig): u64 {
        config.total_supply
    }

    /// Get circulating supply from fractional config
    public fun get_fractional_config_circulating_supply(config: &FractionalConfig): u64 {
        config.circulating_supply
    }

    /// Get trading enabled status from fractional config
    public fun get_fractional_config_trading_enabled(config: &FractionalConfig): bool {
        config.trading_enabled
    }

    /// Get all fractional config fields as tuple
    public fun get_fractional_config_fields(config: &FractionalConfig): (String, u64, u64, bool) {
        (
            config.ticker,
            config.total_supply,
            config.circulating_supply,
            config.trading_enabled
        )
    }}
