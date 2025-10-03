module orbiter::marketplace {
    use std::signer;
    use std::vector;
    use std::string;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::event;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};
    use orbiter::domain_registry::{Self, DomainAsset};
    use orbiter::fractional;

    // ================================
    // Error Codes
    // ================================
    
    /// Marketplace errors
    const ELISTING_NOT_FOUND: u64 = 20;
    const ELISTING_INACTIVE: u64 = 21;
    const EINSUFFICIENT_PAYMENT: u64 = 22;
    const EINVALID_PRICE: u64 = 23;
    const ESELF_TRADE: u64 = 24;
    const EMARKETPLACE_NOT_INITIALIZED: u64 = 25;
    const EINSUFFICIENT_SHARES_TO_LIST: u64 = 26;
    const EINVALID_SHARES_AMOUNT: u64 = 27;
    const EUNAUTHORIZED_SELLER: u64 = 28;
    const ELISTING_ALREADY_EXISTS: u64 = 29;
    const EINVALID_FEE_BPS: u64 = 30;
    
    /// System errors
    const ESYSTEM_PAUSED: u64 = 30;
    const EUNAUTHORIZED_ADMIN: u64 = 31;
    const EZERO_ADDRESS: u64 = 32;

    // ================================
    // Data Structures
    // ================================

    /// A listing for domain shares
    struct ShareListing has key {
        /// The domain object being sold
        domain_object: Object<DomainAsset>,
        /// Address of the seller
        seller: address,
        /// Price per share in APT (in octas)
        price_per_share: u64,
        /// Number of shares available for sale
        shares_available: u64,
        /// Original number of shares when listing was created
        original_shares: u64,
        /// When the listing was created
        created_at: u64,
        /// When the listing was last updated
        updated_at: u64,
        /// Whether the listing is active
        active: bool,
        /// Listing ID for tracking
        listing_id: u64,
    }

    /// Global marketplace state
    struct Marketplace has key {
        /// All active listings by domain object address
        active_listings: Table<address, vector<Object<ShareListing>>>,
        /// Mapping of listing IDs to listing objects
        listing_objects: Table<u64, Object<ShareListing>>,
        /// Trading fee percentage in basis points (e.g., 250 = 2.5%)
        trading_fee_bps: u64,
        /// Fee collector address
        fee_collector: address,
        /// Total trading volume in APT (octas)
        total_volume: u64,
        /// Total number of trades executed
        total_trades: u64,
        /// Total number of listings created
        total_listings: u64,
        /// Next listing ID to assign
        next_listing_id: u64,
        /// Admin address for privileged operations
        admin: address,
        /// Whether trading is paused
        paused: bool,
    }

    /// Trade execution event data
    struct TradeEvent has store, drop {
        /// Domain object involved in trade
        domain_object: address,
        /// Listing object used for trade
        listing_object: address,
        /// Buyer address
        buyer: address,
        /// Seller address
        seller: address,
        /// Number of shares traded
        shares_traded: u64,
        /// Price per share in APT (octas)
        price_per_share: u64,
        /// Total amount paid (shares * price_per_share)
        total_amount: u64,
        /// Fee amount collected
        fee_amount: u64,
        /// Net amount received by seller
        seller_amount: u64,
        /// Timestamp of trade execution
        timestamp: u64,
        /// Trade ID for tracking
        trade_id: u64,
    }

    // ================================
    // Events
    // ================================

    #[event]
    /// Event emitted when marketplace is initialized
    struct MarketplaceInitialized has store, drop {
        /// Admin address
        admin: address,
        /// Trading fee in basis points
        trading_fee_bps: u64,
        /// Fee collector address
        fee_collector: address,
        /// Timestamp of initialization
        timestamp: u64,
    }

    #[event]
    /// Event emitted when a new listing is created
    struct ListingCreated has store, drop {
        /// Listing object address
        listing_object: address,
        /// Domain object being listed
        domain_object: address,
        /// Domain name for reference
        domain_name: string::String,
        /// Seller address
        seller: address,
        /// Price per share in APT (octas)
        price_per_share: u64,
        /// Number of shares listed
        shares_listed: u64,
        /// Listing ID
        listing_id: u64,
        /// Timestamp of creation
        timestamp: u64,
    }

    #[event]
    /// Event emitted when a listing is cancelled
    struct ListingCancelled has store, drop {
        /// Listing object address
        listing_object: address,
        /// Domain object that was listed
        domain_object: address,
        /// Seller address
        seller: address,
        /// Shares that were available
        shares_cancelled: u64,
        /// Listing ID
        listing_id: u64,
        /// Timestamp of cancellation
        timestamp: u64,
    }

    #[event]
    /// Event emitted when a listing price is updated
    struct ListingPriceUpdated has store, drop {
        /// Listing object address
        listing_object: address,
        /// Domain object being listed
        domain_object: address,
        /// Seller address
        seller: address,
        /// Previous price per share
        old_price: u64,
        /// New price per share
        new_price: u64,
        /// Listing ID
        listing_id: u64,
        /// Timestamp of update
        timestamp: u64,
    }

    #[event]
    /// Event emitted when shares are purchased
    struct SharesPurchased has store, drop {
        /// Trade event data
        trade_data: TradeEvent,
        /// Remaining shares in listing after purchase
        remaining_shares: u64,
        /// Whether listing is now inactive (sold out)
        listing_inactive: bool,
    }

    #[event]
    /// Event emitted when marketplace settings are updated
    struct MarketplaceSettingsUpdated has store, drop {
        /// Admin address
        admin: address,
        /// Old trading fee
        old_fee_bps: u64,
        /// New trading fee
        new_fee_bps: u64,
        /// Old fee collector
        old_fee_collector: address,
        /// New fee collector
        new_fee_collector: address,
        /// Timestamp of update
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

    /// Validate price is positive (deprecated - use validation module)
    fun validate_price(price: u64) {
        use orbiter::validation;
        validation::validate_price(price);
    }

    /// Validate shares amount is positive (deprecated - use validation module)
    fun validate_shares_amount(shares: u64) {
        use orbiter::validation;
        validation::validate_shares(shares);
    }

    /// Validate trading fee is within reasonable bounds (deprecated - use validation module)
    fun validate_trading_fee(fee_bps: u64) {
        use orbiter::validation;
        validation::validate_trading_fee(fee_bps);
    }

    /// Calculate trading fee amount
    fun calculate_fee(total_amount: u64, fee_bps: u64): u64 {
        (total_amount * fee_bps) / 10000
    }

    /// Get or initialize domain listings vector
    fun get_or_init_domain_listings(
        active_listings: &mut Table<address, vector<Object<ShareListing>>>,
        domain_addr: address
    ): &mut vector<Object<ShareListing>> {
        if (!table::contains(active_listings, domain_addr)) {
            table::add(active_listings, domain_addr, vector::empty<Object<ShareListing>>());
        };
        table::borrow_mut(active_listings, domain_addr)
    }

    /// Remove listing from domain listings vector
    fun remove_listing_from_domain(
        domain_listings: &mut vector<Object<ShareListing>>,
        listing_obj: Object<ShareListing>
    ) {
        let len = vector::length(domain_listings);
        let i = 0;
        while (i < len) {
            let current_listing = *vector::borrow(domain_listings, i);
            if (object::object_address(&current_listing) == object::object_address(&listing_obj)) {
                vector::remove(domain_listings, i);
                break
            };
            i = i + 1;
        };
    }

    // ================================
    // Marketplace Initialization
    // ================================

    /// Initialize the marketplace with fee configuration
    public fun initialize_marketplace(
        admin: &signer,
        trading_fee_bps: u64,
        fee_collector: address
    ) {
        use orbiter::validation;
        
        let admin_addr = signer::address_of(admin);
        
        // Comprehensive input validation
        validation::validate_marketplace_initialization_inputs(admin_addr, trading_fee_bps, fee_collector);
        
        // Ensure marketplace doesn't already exist
        assert!(!exists<Marketplace>(admin_addr), EMARKETPLACE_NOT_INITIALIZED);
        
        // Create the marketplace
        let marketplace = Marketplace {
            active_listings: table::new(),
            listing_objects: table::new(),
            trading_fee_bps,
            fee_collector,
            total_volume: 0,
            total_trades: 0,
            total_listings: 0,
            next_listing_id: 1,
            admin: admin_addr,
            paused: false,
        };
        
        move_to(admin, marketplace);
        
        // Emit initialization event
        event::emit(MarketplaceInitialized {
            admin: admin_addr,
            trading_fee_bps,
            fee_collector,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Check if marketplace is initialized
    public fun is_marketplace_initialized(): bool {
        exists<Marketplace>(@orbiter)
    }

    /// Get marketplace admin address
    public fun get_marketplace_admin(): address acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        let marketplace = borrow_global<Marketplace>(@orbiter);
        marketplace.admin
    }

    /// Check if marketplace is paused
    public fun is_marketplace_paused(): bool acquires Marketplace {
        if (!exists<Marketplace>(@orbiter)) {
            return true
        };
        let marketplace = borrow_global<Marketplace>(@orbiter);
        marketplace.paused
    }

    /// Get marketplace trading fee
    public fun get_trading_fee(): u64 acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        let marketplace = borrow_global<Marketplace>(@orbiter);
        marketplace.trading_fee_bps
    }

    /// Get fee collector address
    public fun get_fee_collector(): address acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        let marketplace = borrow_global<Marketplace>(@orbiter);
        marketplace.fee_collector
    }

    // ================================
    // Marketplace Management Functions
    // ================================

    /// Pause the marketplace (admin only)
    public fun pause_marketplace(admin: &signer) acquires Marketplace {
        let admin_addr = signer::address_of(admin);
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        assert!(marketplace.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        
        marketplace.paused = true;
    }

    /// Unpause the marketplace (admin only)
    public fun unpause_marketplace(admin: &signer) acquires Marketplace {
        let admin_addr = signer::address_of(admin);
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        assert!(marketplace.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        
        marketplace.paused = false;
    }

    /// Update marketplace settings (admin only)
    public fun update_marketplace_settings(
        admin: &signer,
        new_trading_fee_bps: u64,
        new_fee_collector: address
    ) acquires Marketplace {
        use orbiter::validation;
        
        let admin_addr = signer::address_of(admin);
        
        // Comprehensive input validation
        validation::validate_address(admin_addr);
        validation::validate_trading_fee(new_trading_fee_bps);
        validation::validate_address(new_fee_collector);
        
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        assert!(marketplace.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        
        let old_fee_bps = marketplace.trading_fee_bps;
        let old_fee_collector = marketplace.fee_collector;
        
        marketplace.trading_fee_bps = new_trading_fee_bps;
        marketplace.fee_collector = new_fee_collector;
        
        // Emit settings update event
        event::emit(MarketplaceSettingsUpdated {
            admin: admin_addr,
            old_fee_bps,
            new_fee_bps: new_trading_fee_bps,
            old_fee_collector,
            new_fee_collector,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Update marketplace admin (current admin only)
    public fun update_marketplace_admin(
        current_admin: &signer,
        new_admin: address
    ) acquires Marketplace {
        let current_admin_addr = signer::address_of(current_admin);
        validate_address(new_admin);
        
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        assert!(marketplace.admin == current_admin_addr, EUNAUTHORIZED_ADMIN);
        
        marketplace.admin = new_admin;
    }

    // ================================
    // Listing Query Functions
    // ================================

    /// Get listing details
    public fun get_listing_details(listing_obj: Object<ShareListing>): (
        address,    // domain_object
        address,    // seller
        u64,        // price_per_share
        u64,        // shares_available
        u64,        // original_shares
        u64,        // created_at
        u64,        // updated_at
        bool,       // active
        u64         // listing_id
    ) acquires ShareListing {
        let listing_addr = object::object_address(&listing_obj);
        assert!(exists<ShareListing>(listing_addr), ELISTING_NOT_FOUND);
        
        let listing = borrow_global<ShareListing>(listing_addr);
        (
            object::object_address(&listing.domain_object),
            listing.seller,
            listing.price_per_share,
            listing.shares_available,
            listing.original_shares,
            listing.created_at,
            listing.updated_at,
            listing.active,
            listing.listing_id
        )
    }

    /// Check if listing is active
    public fun is_listing_active(listing_obj: Object<ShareListing>): bool acquires ShareListing {
        let listing_addr = object::object_address(&listing_obj);
        if (!exists<ShareListing>(listing_addr)) {
            return false
        };
        
        let listing = borrow_global<ShareListing>(listing_addr);
        listing.active && listing.shares_available > 0
    }

    /// Get all active listings for a domain
    public fun get_domain_listings(
        domain_obj: Object<DomainAsset>
    ): vector<Object<ShareListing>> acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global<Marketplace>(@orbiter);
        let domain_addr = object::object_address(&domain_obj);
        
        if (table::contains(&marketplace.active_listings, domain_addr)) {
            *table::borrow(&marketplace.active_listings, domain_addr)
        } else {
            vector::empty<Object<ShareListing>>()
        }
    }

    /// Get listing by ID
    public fun get_listing_by_id(listing_id: u64): Object<ShareListing> acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global<Marketplace>(@orbiter);
        assert!(table::contains(&marketplace.listing_objects, listing_id), ELISTING_NOT_FOUND);
        
        *table::borrow(&marketplace.listing_objects, listing_id)
    }

    /// Check if listing exists by ID
    public fun listing_exists(listing_id: u64): bool acquires Marketplace {
        if (!exists<Marketplace>(@orbiter)) {
            return false
        };
        
        let marketplace = borrow_global<Marketplace>(@orbiter);
        table::contains(&marketplace.listing_objects, listing_id)
    }

    // ================================
    // Marketplace Statistics Functions
    // ================================

    /// Get comprehensive marketplace statistics
    public fun get_marketplace_stats(): (u64, u64, u64, u64) acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global<Marketplace>(@orbiter);
        (
            marketplace.total_volume,
            marketplace.total_trades,
            marketplace.total_listings,
            marketplace.next_listing_id - 1  // Current highest listing ID
        )
    }

    /// Get total trading volume
    public fun get_total_volume(): u64 acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global<Marketplace>(@orbiter);
        marketplace.total_volume
    }

    /// Get total number of trades
    public fun get_total_trades(): u64 acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global<Marketplace>(@orbiter);
        marketplace.total_trades
    }

    /// Get total number of listings created
    public fun get_total_listings(): u64 acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global<Marketplace>(@orbiter);
        marketplace.total_listings
    }

    /// Get number of active listings for a domain
    public fun get_domain_listing_count(domain_obj: Object<DomainAsset>): u64 acquires Marketplace {
        let listings = get_domain_listings(domain_obj);
        vector::length(&listings)
    }

    /// Calculate market cap for a domain based on active listings
    public fun calculate_domain_market_cap(domain_obj: Object<DomainAsset>): u64 acquires Marketplace, ShareListing {
        let listings = get_domain_listings(domain_obj);
        let total_supply = fractional::get_total_supply(domain_obj);
        
        if (vector::length(&listings) == 0 || total_supply == 0) {
            return 0
        };
        
        // Use the lowest ask price as market price
        let market_price = 0;
        let i = 0;
        let len = vector::length(&listings);
        
        while (i < len) {
            let listing_obj = *vector::borrow(&listings, i);
            if (is_listing_active(listing_obj)) {
                let (_, _, price_per_share, _, _, _, _, _, _) = get_listing_details(listing_obj);
                if (market_price == 0 || price_per_share < market_price) {
                    market_price = price_per_share;
                };
            };
            i = i + 1;
        };
        
        market_price * total_supply
    }

    // ================================
    // Listing Creation and Management Functions
    // ================================

    /// Create a new share listing
    public fun create_listing(
        seller: &signer,
        domain_obj: Object<DomainAsset>,
        price_per_share: u64,
        shares_to_sell: u64
    ): Object<ShareListing> acquires Marketplace {
        use orbiter::validation;
        use orbiter::security;
        
        let seller_addr = signer::address_of(seller);
        
        // Comprehensive input validation
        validation::validate_listing_params(seller_addr, price_per_share, shares_to_sell);
        validation::validate_domain_object_exists(domain_obj);
        
        // Ensure marketplace is initialized and not paused
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        
        // Check if seller has sufficient shares
        let seller_balance = fractional::get_share_balance(domain_obj, seller_addr);
        
        // Access control and security checks
        security::verify_listing_creation_access(seller, domain_obj, shares_to_sell, seller_balance, marketplace.paused);
        
        // Check if seller has sufficient shares
        let seller_balance = fractional::get_share_balance(domain_obj, seller_addr);
        assert!(seller_balance >= shares_to_sell, EINSUFFICIENT_SHARES_TO_LIST);
        
        // Get domain information for event
        let (domain_name, _, _) = domain_registry::get_domain_info(domain_obj);
        
        // Create the listing object
        let listing_constructor_ref = object::create_object(seller_addr);
        let listing_signer = object::generate_signer(&listing_constructor_ref);
        let listing_obj = object::object_from_constructor_ref(&listing_constructor_ref);
        
        // Get listing ID and increment counter
        let listing_id = marketplace.next_listing_id;
        marketplace.next_listing_id = marketplace.next_listing_id + 1;
        marketplace.total_listings = marketplace.total_listings + 1;
        
        let current_time = timestamp::now_seconds();
        
        // Create the ShareListing resource
        let share_listing = ShareListing {
            domain_object: domain_obj,
            seller: seller_addr,
            price_per_share,
            shares_available: shares_to_sell,
            original_shares: shares_to_sell,
            created_at: current_time,
            updated_at: current_time,
            active: true,
            listing_id,
        };
        
        move_to(&listing_signer, share_listing);
        
        // Add to marketplace tracking
        let domain_addr = object::object_address(&domain_obj);
        let domain_listings = get_or_init_domain_listings(&mut marketplace.active_listings, domain_addr);
        vector::push_back(domain_listings, listing_obj);
        
        // Add to listing objects mapping
        table::add(&mut marketplace.listing_objects, listing_id, listing_obj);
        
        // Emit listing created event
        event::emit(ListingCreated {
            listing_object: object::object_address(&listing_obj),
            domain_object: domain_addr,
            domain_name,
            seller: seller_addr,
            price_per_share,
            shares_listed: shares_to_sell,
            listing_id,
            timestamp: current_time,
        });
        
        listing_obj
    }

    /// Entry wrapper: create listing by domain object address
    public entry fun create_listing_entry(
        seller: &signer,
        domain_object_addr: address,
        price_per_share: u64,
        shares_to_sell: u64
    ) acquires Marketplace {
        let domain_obj = object::address_to_object<DomainAsset>(domain_object_addr);
        let _ = create_listing(seller, domain_obj, price_per_share, shares_to_sell);
    }

    /// Cancel an active listing
    public fun cancel_listing(
        seller: &signer,
        listing_obj: Object<ShareListing>
    ) acquires Marketplace, ShareListing {
        let seller_addr = signer::address_of(seller);
        let listing_addr = object::object_address(&listing_obj);
        
        // Ensure marketplace is initialized
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        
        // Ensure listing exists
        assert!(exists<ShareListing>(listing_addr), ELISTING_NOT_FOUND);
        let listing = borrow_global_mut<ShareListing>(listing_addr);
        
        // Verify seller authorization
        assert!(listing.seller == seller_addr, EUNAUTHORIZED_SELLER);
        
        // Ensure listing is active
        assert!(listing.active, ELISTING_INACTIVE);
        
        // Deactivate the listing
        listing.active = false;
        listing.updated_at = timestamp::now_seconds();
        
        let shares_cancelled = listing.shares_available;
        let listing_id = listing.listing_id;
        let domain_addr = object::object_address(&listing.domain_object);
        
        // Remove from active listings
        let domain_listings = table::borrow_mut(&mut marketplace.active_listings, domain_addr);
        remove_listing_from_domain(domain_listings, listing_obj);
        
        // Remove from listing objects mapping
        table::remove(&mut marketplace.listing_objects, listing_id);
        
        // Emit listing cancelled event
        event::emit(ListingCancelled {
            listing_object: listing_addr,
            domain_object: domain_addr,
            seller: seller_addr,
            shares_cancelled,
            listing_id,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Update the price of an existing listing
    public fun update_listing_price(
        seller: &signer,
        listing_obj: Object<ShareListing>,
        new_price: u64
    ) acquires ShareListing {
        use orbiter::validation;
        
        let seller_addr = signer::address_of(seller);
        let listing_addr = object::object_address(&listing_obj);
        
        // Comprehensive input validation
        validation::validate_address(seller_addr);
        validation::validate_price(new_price);
        
        // Ensure listing exists
        assert!(exists<ShareListing>(listing_addr), ELISTING_NOT_FOUND);
        let listing = borrow_global_mut<ShareListing>(listing_addr);
        
        // Verify seller authorization
        assert!(listing.seller == seller_addr, EUNAUTHORIZED_SELLER);
        
        // Ensure listing is active
        assert!(listing.active, ELISTING_INACTIVE);
        
        let old_price = listing.price_per_share;
        
        // Update the price and timestamp
        listing.price_per_share = new_price;
        listing.updated_at = timestamp::now_seconds();
        
        // Emit price update event
        event::emit(ListingPriceUpdated {
            listing_object: listing_addr,
            domain_object: object::object_address(&listing.domain_object),
            seller: seller_addr,
            old_price,
            new_price,
            listing_id: listing.listing_id,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Activate a previously deactivated listing
    public fun activate_listing(
        seller: &signer,
        listing_obj: Object<ShareListing>
    ) acquires Marketplace, ShareListing {
        let seller_addr = signer::address_of(seller);
        let listing_addr = object::object_address(&listing_obj);
        
        // Ensure marketplace is initialized and not paused
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        assert!(!marketplace.paused, ESYSTEM_PAUSED);
        
        // Ensure listing exists
        assert!(exists<ShareListing>(listing_addr), ELISTING_NOT_FOUND);
        let listing = borrow_global_mut<ShareListing>(listing_addr);
        
        // Verify seller authorization
        assert!(listing.seller == seller_addr, EUNAUTHORIZED_SELLER);
        
        // Ensure listing is currently inactive
        assert!(!listing.active, ELISTING_ALREADY_EXISTS);
        
        // Ensure seller still has the shares
        let seller_balance = fractional::get_share_balance(listing.domain_object, seller_addr);
        assert!(seller_balance >= listing.shares_available, EINSUFFICIENT_SHARES_TO_LIST);
        
        // Activate the listing
        listing.active = true;
        listing.updated_at = timestamp::now_seconds();
        
        // Add back to active listings
        let domain_addr = object::object_address(&listing.domain_object);
        let domain_listings = get_or_init_domain_listings(&mut marketplace.active_listings, domain_addr);
        vector::push_back(domain_listings, listing_obj);
        
        // Add back to listing objects mapping
        table::add(&mut marketplace.listing_objects, listing.listing_id, listing_obj);
    }

    /// Deactivate an active listing (without cancelling)
    public fun deactivate_listing(
        seller: &signer,
        listing_obj: Object<ShareListing>
    ) acquires Marketplace, ShareListing {
        let seller_addr = signer::address_of(seller);
        let listing_addr = object::object_address(&listing_obj);
        
        // Ensure marketplace is initialized
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        
        // Ensure listing exists
        assert!(exists<ShareListing>(listing_addr), ELISTING_NOT_FOUND);
        let listing = borrow_global_mut<ShareListing>(listing_addr);
        
        // Verify seller authorization
        assert!(listing.seller == seller_addr, EUNAUTHORIZED_SELLER);
        
        // Ensure listing is active
        assert!(listing.active, ELISTING_INACTIVE);
        
        // Deactivate the listing
        listing.active = false;
        listing.updated_at = timestamp::now_seconds();
        
        // Remove from active listings
        let domain_addr = object::object_address(&listing.domain_object);
        let domain_listings = table::borrow_mut(&mut marketplace.active_listings, domain_addr);
        remove_listing_from_domain(domain_listings, listing_obj);
        
        // Remove from listing objects mapping
        table::remove(&mut marketplace.listing_objects, listing.listing_id);
    }

    /// Update listing shares available (for partial fills)
    fun update_listing_shares(
        listing_obj: Object<ShareListing>,
        shares_sold: u64
    ) acquires Marketplace, ShareListing {
        let listing_addr = object::object_address(&listing_obj);
        let listing = borrow_global_mut<ShareListing>(listing_addr);
        
        // Ensure sufficient shares available
        assert!(listing.shares_available >= shares_sold, EINSUFFICIENT_SHARES_TO_LIST);
        
        // Update available shares
        listing.shares_available = listing.shares_available - shares_sold;
        listing.updated_at = timestamp::now_seconds();
        
        // If no shares left, deactivate the listing
        if (listing.shares_available == 0) {
            listing.active = false;
            
            // Remove from active listings
            let marketplace = borrow_global_mut<Marketplace>(@orbiter);
            let domain_addr = object::object_address(&listing.domain_object);
            let domain_listings = table::borrow_mut(&mut marketplace.active_listings, domain_addr);
            remove_listing_from_domain(domain_listings, listing_obj);
            
            // Remove from listing objects mapping
            table::remove(&mut marketplace.listing_objects, listing.listing_id);
        };
    }

    // ================================
    // Trade Execution and Settlement Functions
    // ================================

    /// Buy shares from an active listing
    public fun buy_shares(
        buyer: &signer,
        listing_obj: Object<ShareListing>,
        shares_to_buy: u64
    ) acquires Marketplace, ShareListing {
        use aptos_framework::coin;
        use aptos_framework::aptos_coin::AptosCoin;
        use orbiter::security;
        
        let buyer_addr = signer::address_of(buyer);
        let listing_addr = object::object_address(&listing_obj);
        
        // Ensure marketplace is initialized and not paused
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        assert!(!marketplace.paused, ESYSTEM_PAUSED);
        
        // Validate trade inputs
        assert!(
            validate_trade_inputs(listing_obj, buyer_addr, shares_to_buy),
            EINVALID_SHARES_AMOUNT
        );
        
        // Get listing details first to avoid borrow conflicts
        let (domain_object, seller, price_per_share, shares_available, _, _, _, active, _) = get_listing_details(listing_obj);
        
        // Ensure listing is active and has sufficient shares
        assert!(active, ELISTING_INACTIVE);
        assert!(shares_available >= shares_to_buy, EINSUFFICIENT_SHARES_TO_LIST);
        
        // Prevent self-trading
        assert!(buyer_addr != seller, ESELF_TRADE);
        
        // Calculate payment amounts
        let total_amount = price_per_share * shares_to_buy;
        let fee_amount = calculate_fee(total_amount, marketplace.trading_fee_bps);
        let seller_amount = total_amount - fee_amount;
        
        // Verify buyer has sufficient balance
        let buyer_balance = coin::balance<AptosCoin>(buyer_addr);
        assert!(buyer_balance >= total_amount, EINSUFFICIENT_PAYMENT);
        
        // Execute the trade atomically with reentrancy protection
        // Acquire reentrancy lock for critical trade execution
        security::acquire_reentrancy_lock(buyer);
        
        // Store values we need before borrowing
        let fee_collector = marketplace.fee_collector;
        let domain_obj_for_transfer = object::address_to_object<DomainAsset>(domain_object);
        
        // 1. Transfer payment from buyer to seller
        if (seller_amount > 0) {
            coin::transfer<AptosCoin>(buyer, seller, seller_amount);
        };
        
        // 2. Transfer fee to fee collector
        if (fee_amount > 0) {
            coin::transfer<AptosCoin>(buyer, fee_collector, fee_amount);
        };
        
        // 3. Transfer shares from seller to buyer
        fractional::transfer_shares_internal(
            domain_obj_for_transfer,
            seller,
            buyer_addr,
            shares_to_buy
        );
        
        // Release reentrancy lock after critical operations
        security::release_reentrancy_lock(buyer);
        
        // 4. Update marketplace statistics and get trade ID
        marketplace.total_volume = marketplace.total_volume + total_amount;
        marketplace.total_trades = marketplace.total_trades + 1;
        let trade_id = marketplace.total_trades;
        
        let current_time = timestamp::now_seconds();
        
        // Create trade event data
        let trade_data = TradeEvent {
            domain_object: domain_object,
            listing_object: listing_addr,
            buyer: buyer_addr,
            seller: seller,
            shares_traded: shares_to_buy,
            price_per_share: price_per_share,
            total_amount,
            fee_amount,
            seller_amount,
            timestamp: current_time,
            trade_id,
        };
        
        // Check if listing is now inactive (sold out)
        let remaining_shares = shares_available - shares_to_buy;
        let listing_inactive = remaining_shares == 0;
        
        // Update listing shares inline to avoid borrow conflicts
        {
            let listing = borrow_global_mut<ShareListing>(listing_addr);
            listing.shares_available = listing.shares_available - shares_to_buy;
            listing.updated_at = current_time;
            
            // If no shares left, deactivate the listing
            if (listing.shares_available == 0) {
                listing.active = false;
                
                // Remove from active listings
                let marketplace_mut = borrow_global_mut<Marketplace>(@orbiter);
                let domain_listings = table::borrow_mut(&mut marketplace_mut.active_listings, domain_object);
                remove_listing_from_domain(domain_listings, listing_obj);
                
                // Remove from listing objects mapping
                table::remove(&mut marketplace_mut.listing_objects, listing.listing_id);
            };
        };
        
        // Emit shares purchased event
        event::emit(SharesPurchased {
            trade_data,
            remaining_shares,
            listing_inactive,
        });
    }

    /// Entry wrapper: buy shares by listing object address
    public entry fun buy_shares_entry(
        buyer: &signer,
        listing_object_addr: address,
        shares_to_buy: u64
    ) acquires Marketplace, ShareListing {
        let listing_obj = object::address_to_object<ShareListing>(listing_object_addr);
        buy_shares(buyer, listing_obj, shares_to_buy);
    }

    /// Execute a market buy order (buy at best available price)
    public fun market_buy_shares(
        buyer: &signer,
        domain_obj: Object<DomainAsset>,
        max_shares_to_buy: u64,
        max_price_per_share: u64
    ) acquires Marketplace, ShareListing {
        let _buyer_addr = signer::address_of(buyer);
        
        // Get all active listings for the domain
        let listings = get_domain_listings(domain_obj);
        let listings_len = vector::length(&listings);
        
        assert!(listings_len > 0, ELISTING_NOT_FOUND);
        
        // Find the best (lowest) price listing with available shares
        let best_listing_idx = 0;
        let best_price = 0;
        let i = 0;
        
        while (i < listings_len) {
            let listing_obj = *vector::borrow(&listings, i);
            if (is_listing_active(listing_obj)) {
                let (_, _, price_per_share, shares_available, _, _, _, _, _) = get_listing_details(listing_obj);
                
                if (shares_available > 0 && 
                    price_per_share <= max_price_per_share &&
                    (best_price == 0 || price_per_share < best_price)) {
                    best_price = price_per_share;
                    best_listing_idx = i;
                };
            };
            i = i + 1;
        };
        
        assert!(best_price > 0, ELISTING_NOT_FOUND);
        
        // Execute trade with the best listing
        let best_listing = *vector::borrow(&listings, best_listing_idx);
        let (_, _, _, shares_available, _, _, _, _, _) = get_listing_details(best_listing);
        
        let shares_to_buy = if (shares_available < max_shares_to_buy) {
            shares_available
        } else {
            max_shares_to_buy
        };
        
        buy_shares(buyer, best_listing, shares_to_buy);
    }

    /// Execute a limit buy order (create a buy order at specific price)
    /// Note: This is a simplified version - full implementation would require order book
    public fun limit_buy_shares(
        buyer: &signer,
        domain_obj: Object<DomainAsset>,
        shares_to_buy: u64,
        max_price_per_share: u64
    ) acquires Marketplace, ShareListing {
        // Get all active listings for the domain
        let listings = get_domain_listings(domain_obj);
        let listings_len = vector::length(&listings);
        
        let i = 0;
        let shares_remaining = shares_to_buy;
        
        // Try to fill the order with existing listings at or below the limit price
        while (i < listings_len && shares_remaining > 0) {
            let listing_obj = *vector::borrow(&listings, i);
            
            if (is_listing_active(listing_obj)) {
                let (_, _, price_per_share, shares_available, _, _, _, _, _) = get_listing_details(listing_obj);
                
                if (price_per_share <= max_price_per_share && shares_available > 0) {
                    let shares_to_buy_from_listing = if (shares_available < shares_remaining) {
                        shares_available
                    } else {
                        shares_remaining
                    };
                    
                    buy_shares(buyer, listing_obj, shares_to_buy_from_listing);
                    shares_remaining = shares_remaining - shares_to_buy_from_listing;
                };
            };
            
            i = i + 1;
        };
        
        // Note: In a full implementation, remaining shares would create a buy order
        // For now, we just execute what we can immediately
    }

    /// Batch buy shares from multiple listings
    public fun batch_buy_shares(
        buyer: &signer,
        listing_objs: vector<Object<ShareListing>>,
        shares_amounts: vector<u64>
    ) acquires Marketplace, ShareListing {
        let listings_len = vector::length(&listing_objs);
        let amounts_len = vector::length(&shares_amounts);
        
        assert!(listings_len == amounts_len, EINVALID_SHARES_AMOUNT);
        assert!(listings_len > 0, ELISTING_NOT_FOUND);
        
        let i = 0;
        while (i < listings_len) {
            let listing_obj = *vector::borrow(&listing_objs, i);
            let shares_amount = *vector::borrow(&shares_amounts, i);
            
            if (shares_amount > 0 && is_listing_active(listing_obj)) {
                buy_shares(buyer, listing_obj, shares_amount);
            };
            
            i = i + 1;
        };
    }

    /// Calculate total cost for buying specific shares from a listing
    public fun calculate_trade_cost(
        listing_obj: Object<ShareListing>,
        shares_to_buy: u64
    ): (u64, u64, u64) acquires Marketplace, ShareListing {
        // Returns: (total_cost, fee_amount, seller_amount)
        
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        let marketplace = borrow_global<Marketplace>(@orbiter);
        
        let (_, _, price_per_share, shares_available, _, _, _, _, _) = get_listing_details(listing_obj);
        
        assert!(shares_available >= shares_to_buy, EINSUFFICIENT_SHARES_TO_LIST);
        
        let total_cost = price_per_share * shares_to_buy;
        let fee_amount = calculate_fee(total_cost, marketplace.trading_fee_bps);
        let seller_amount = total_cost - fee_amount;
        
        (total_cost, fee_amount, seller_amount)
    }

    /// Get the best ask price (lowest price) for a domain
    public fun get_best_ask_price(domain_obj: Object<DomainAsset>): u64 acquires Marketplace, ShareListing {
        let listings = get_domain_listings(domain_obj);
        let listings_len = vector::length(&listings);
        
        if (listings_len == 0) {
            return 0
        };
        
        let best_price = 0;
        let i = 0;
        
        while (i < listings_len) {
            let listing_obj = *vector::borrow(&listings, i);
            if (is_listing_active(listing_obj)) {
                let (_, _, price_per_share, shares_available, _, _, _, _, _) = get_listing_details(listing_obj);
                
                if (shares_available > 0 && (best_price == 0 || price_per_share < best_price)) {
                    best_price = price_per_share;
                };
            };
            i = i + 1;
        };
        
        best_price
    }

    /// Get the total liquidity (shares available) at a specific price level
    public fun get_liquidity_at_price(
        domain_obj: Object<DomainAsset>,
        price_per_share: u64
    ): u64 acquires Marketplace, ShareListing {
        let listings = get_domain_listings(domain_obj);
        let listings_len = vector::length(&listings);
        
        let total_shares = 0;
        let i = 0;
        
        while (i < listings_len) {
            let listing_obj = *vector::borrow(&listings, i);
            if (is_listing_active(listing_obj)) {
                let (_, _, listing_price, shares_available, _, _, _, _, _) = get_listing_details(listing_obj);
                
                if (listing_price == price_per_share) {
                    total_shares = total_shares + shares_available;
                };
            };
            i = i + 1;
        };
        
        total_shares
    }

    /// Emergency function to cancel all listings for a domain (admin only)
    public fun emergency_cancel_domain_listings(
        admin: &signer,
        domain_obj: Object<DomainAsset>
    ) acquires Marketplace, ShareListing {
        let admin_addr = signer::address_of(admin);
        let domain_addr = object::object_address(&domain_obj);
        
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        // First get the listings without borrowing marketplace
        let listings = get_domain_listings(domain_obj);
        let listings_len = vector::length(&listings);
        
        // Collect listing IDs to remove
        let listing_ids_to_remove = vector::empty<u64>();
        
        let i = 0;
        while (i < listings_len) {
            let listing_obj = *vector::borrow(&listings, i);
            let listing_addr = object::object_address(&listing_obj);
            
            if (exists<ShareListing>(listing_addr)) {
                let listing = borrow_global_mut<ShareListing>(listing_addr);
                if (listing.active) {
                    listing.active = false;
                    listing.updated_at = timestamp::now_seconds();
                    vector::push_back(&mut listing_ids_to_remove, listing.listing_id);
                };
            };
            
            i = i + 1;
        };
        
        // Now borrow marketplace and remove listings
        let marketplace = borrow_global_mut<Marketplace>(@orbiter);
        assert!(marketplace.admin == admin_addr, EUNAUTHORIZED_ADMIN);
        
        // Remove from listing objects mapping
        let ids_len = vector::length(&listing_ids_to_remove);
        i = 0;
        while (i < ids_len) {
            let listing_id = *vector::borrow(&listing_ids_to_remove, i);
            if (table::contains(&marketplace.listing_objects, listing_id)) {
                table::remove(&mut marketplace.listing_objects, listing_id);
            };
            i = i + 1;
        };
        
        // Clear the domain listings vector
        if (table::contains(&mut marketplace.active_listings, domain_addr)) {
            let domain_listings = table::borrow_mut(&mut marketplace.active_listings, domain_addr);
            *domain_listings = vector::empty<Object<ShareListing>>();
        };
    }

    // ================================
    // Advanced Query and Analytics Functions
    // ================================

    /// Get comprehensive market data for a domain
    public fun get_domain_market_data(domain_obj: Object<DomainAsset>): (
        u64,    // total_listings
        u64,    // total_shares_listed
        u64,    // lowest_price
        u64,    // highest_price
        u64,    // average_price
        u64     // market_cap
    ) acquires Marketplace, ShareListing {
        let listings = get_domain_listings(domain_obj);
        let listings_len = vector::length(&listings);
        
        if (listings_len == 0) {
            return (0, 0, 0, 0, 0, 0)
        };
        
        let total_shares_listed = 0;
        let lowest_price = 0;
        let highest_price = 0;
        let total_value = 0;
        let active_listings = 0;
        
        let i = 0;
        while (i < listings_len) {
            let listing_obj = *vector::borrow(&listings, i);
            if (is_listing_active(listing_obj)) {
                let (_, _, price_per_share, shares_available, _, _, _, _, _) = get_listing_details(listing_obj);
                
                total_shares_listed = total_shares_listed + shares_available;
                total_value = total_value + (price_per_share * shares_available);
                active_listings = active_listings + 1;
                
                if (lowest_price == 0 || price_per_share < lowest_price) {
                    lowest_price = price_per_share;
                };
                
                if (price_per_share > highest_price) {
                    highest_price = price_per_share;
                };
            };
            i = i + 1;
        };
        
        let average_price = if (total_shares_listed > 0) {
            total_value / total_shares_listed
        } else {
            0
        };
        
        let market_cap = calculate_domain_market_cap(domain_obj);
        
        (active_listings, total_shares_listed, lowest_price, highest_price, average_price, market_cap)
    }

    /// Get trade history for a domain (simplified version)
    public fun get_domain_trade_summary(domain_obj: Object<DomainAsset>): (
        u64,    // estimated_trades (based on total marketplace trades)
        u64,    // estimated_volume (based on market cap)
        u64     // current_listings
    ) acquires Marketplace {
        let (total_volume, total_trades, _, _) = get_marketplace_stats();
        let current_listings = get_domain_listing_count(domain_obj);
        
        // Simplified estimation - in production, you'd track per-domain stats
        let estimated_domain_trades = total_trades / 10; // Rough estimate
        let estimated_domain_volume = total_volume / 20; // Rough estimate
        
        (estimated_domain_trades, estimated_domain_volume, current_listings)
    }

    /// Get price range analysis for a domain
    public fun get_price_range_analysis(domain_obj: Object<DomainAsset>): (
        u64,    // min_price
        u64,    // max_price
        u64,    // price_spread_percentage
        u64     // liquidity_depth
    ) acquires Marketplace, ShareListing {
        let listings = get_domain_listings(domain_obj);
        let listings_len = vector::length(&listings);
        
        if (listings_len == 0) {
            return (0, 0, 0, 0)
        };
        
        let min_price = 0;
        let max_price = 0;
        let total_liquidity = 0;
        
        let i = 0;
        while (i < listings_len) {
            let listing_obj = *vector::borrow(&listings, i);
            if (is_listing_active(listing_obj)) {
                let (_, _, price_per_share, shares_available, _, _, _, _, _) = get_listing_details(listing_obj);
                
                total_liquidity = total_liquidity + shares_available;
                
                if (min_price == 0 || price_per_share < min_price) {
                    min_price = price_per_share;
                };
                
                if (price_per_share > max_price) {
                    max_price = price_per_share;
                };
            };
            i = i + 1;
        };
        
        let price_spread_percentage = if (min_price > 0) {
            ((max_price - min_price) * 10000) / min_price // Basis points
        } else {
            0
        };
        
        (min_price, max_price, price_spread_percentage, total_liquidity)
    }

    /// Get top listings by volume for a domain
    public fun get_top_listings_by_volume(
        domain_obj: Object<DomainAsset>,
        limit: u64
    ): vector<Object<ShareListing>> acquires Marketplace, ShareListing {
        let listings = get_domain_listings(domain_obj);
        let listings_len = vector::length(&listings);
        
        if (listings_len == 0 || limit == 0) {
            return vector::empty<Object<ShareListing>>()
        };
        
        // Simple implementation - return first 'limit' active listings
        // In production, you'd sort by volume
        let result = vector::empty<Object<ShareListing>>();
        let count = 0;
        let i = 0;
        
        while (i < listings_len && count < limit) {
            let listing_obj = *vector::borrow(&listings, i);
            if (is_listing_active(listing_obj)) {
                vector::push_back(&mut result, listing_obj);
                count = count + 1;
            };
            i = i + 1;
        };
        
        result
    }

    /// Get marketplace health metrics
    public fun get_marketplace_health_metrics(): (
        u64,    // total_active_listings
        u64,    // total_domains_with_listings
        u64,    // average_listings_per_domain
        bool    // is_healthy (basic check)
    ) acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global<Marketplace>(@orbiter);
        
        // Get values we need from marketplace first
        let is_paused = marketplace.paused;
        let _total_volume = marketplace.total_volume;
        let total_trades = marketplace.total_trades;
        let total_listings = marketplace.total_listings;
        
        // Count total active listings across all domains
        // Note: This is a simplified implementation
        let total_active_listings = total_listings;
        let total_domains_with_listings = 0; // Would need to be tracked separately
        
        let average_listings_per_domain = if (total_domains_with_listings > 0) {
            total_active_listings / total_domains_with_listings
        } else {
            0
        };
        
        let is_healthy = !is_paused && total_trades > 0;
        
        (total_listings, total_domains_with_listings, average_listings_per_domain, is_healthy)
    }

    /// Get fee analysis for potential trades
    public fun calculate_trade_fees(
        total_amount: u64
    ): (u64, u64, u64) acquires Marketplace {
        assert!(exists<Marketplace>(@orbiter), EMARKETPLACE_NOT_INITIALIZED);
        
        let marketplace = borrow_global<Marketplace>(@orbiter);
        let fee_amount = calculate_fee(total_amount, marketplace.trading_fee_bps);
        let seller_amount = total_amount - fee_amount;
        
        (total_amount, fee_amount, seller_amount)
    }

    // ================================
    // Input Validation Functions
    // ================================

    /// Comprehensive validation for listing creation
    public fun validate_listing_creation_inputs(
        domain_obj: Object<DomainAsset>,
        seller: address,
        price_per_share: u64,
        shares_to_sell: u64
    ): bool {
        // Validate basic inputs
        if (price_per_share == 0 || shares_to_sell == 0) {
            return false
        };
        
        // Validate seller address
        if (seller == @0x0) {
            return false
        };
        
        // Check if domain has fractional ownership enabled
        if (!domain_registry::is_trading_enabled(domain_obj)) {
            return false
        };
        
        // Check if seller has sufficient shares
        let seller_balance = fractional::get_share_balance(domain_obj, seller);
        if (seller_balance < shares_to_sell) {
            return false
        };
        
        true
    }

    /// Validate trade execution inputs
    public fun validate_trade_inputs(
        listing_obj: Object<ShareListing>,
        buyer: address,
        shares_to_buy: u64
    ): bool acquires ShareListing {
        use orbiter::validation;
        
        // Use comprehensive validation module
        validation::validate_address(buyer);
        validation::validate_shares(shares_to_buy);
        
        // Check if listing exists and is active
        if (!is_listing_active(listing_obj)) {
            return false
        };
        
        // Check if enough shares are available and prevent self-trading
        let (_, seller, price_per_share, shares_available, _, _, _, _, _) = get_listing_details(listing_obj);
        
        // Use validation module for trade parameters
        validation::validate_trade_params(buyer, seller, shares_to_buy, price_per_share);
        validation::validate_sufficient_balance(shares_available, shares_to_buy);
        
        true
    }
}