module orbiter::fractional {
    use std::signer;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};
    use orbiter::domain_registry::{Self, DomainAsset};
    
    friend orbiter::marketplace;

    // ================================
    // Error Codes
    // ================================
    
    /// Fractional ownership errors
    const EINSUFFICIENT_SHARES: u64 = 10;
    const EINVALID_SHARE_AMOUNT: u64 = 11;
    const EINSUFFICIENT_ALLOWANCE: u64 = 12;
    const EFRACTIONAL_NOT_ENABLED: u64 = 13;
    const ESHARE_OWNERSHIP_NOT_INITIALIZED: u64 = 14;
    const ESHARE_ALLOWANCE_NOT_INITIALIZED: u64 = 15;
    const EINVALID_TOTAL_SUPPLY: u64 = 16;
    const ESELF_TRANSFER: u64 = 17;
    const EUNAUTHORIZED_DOMAIN_OWNER: u64 = 18;
    const EZERO_ADDRESS: u64 = 19;

    // ================================
    // Data Structures
    // ================================

    /// Share ownership tracking for a domain
    struct ShareOwnership has key {
        /// Reference to the underlying domain object
        domain_object: Object<DomainAsset>,
        /// Mapping of addresses to share balances
        balances: Table<address, u64>,
        /// Total shares issued
        total_shares: u64,
        /// Share transfer events counter for tracking
        transfer_event_count: u64,
    }

    /// Event emitted when shares are transferred
    struct ShareTransferEvent has store, drop {
        /// Domain object address
        domain_object: address,
        /// Address sending shares
        from: address,
        /// Address receiving shares
        to: address,
        /// Number of shares transferred
        amount: u64,
        /// Timestamp of transfer
        timestamp: u64,
        /// Event sequence number
        event_id: u64,
    }

    /// Allowance for third-party transfers
    struct ShareAllowance has key {
        /// Domain object this allowance is for
        domain_object: Object<DomainAsset>,
        /// Owner -> Spender -> Amount mapping
        allowances: Table<address, Table<address, u64>>,
    }

    // ================================
    // Events
    // ================================

    #[event]
    /// Event emitted when fractional ownership is initialized
    struct FractionalOwnershipInitialized has store, drop {
        /// Domain object address
        domain_object: address,
        /// Domain name
        domain_name: std::string::String,
        /// Initial owner address
        owner: address,
        /// Total supply of shares
        total_supply: u64,
        /// Ticker symbol
        ticker: std::string::String,
        /// Timestamp of initialization
        timestamp: u64,
    }

    #[event]
    /// Event emitted when shares are transferred
    struct SharesTransferred has store, drop {
        /// Domain object address
        domain_object: address,
        /// Address sending shares
        from: address,
        /// Address receiving shares
        to: address,
        /// Number of shares transferred
        amount: u64,
        /// Remaining balance of sender
        from_balance: u64,
        /// New balance of receiver
        to_balance: u64,
        /// Timestamp of transfer
        timestamp: u64,
    }

    #[event]
    /// Event emitted when allowance is set
    struct AllowanceSet has store, drop {
        /// Domain object address
        domain_object: address,
        /// Owner of the shares
        owner: address,
        /// Spender being approved
        spender: address,
        /// Amount approved
        amount: u64,
        /// Timestamp of approval
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

    /// Validate that share amount is positive (deprecated - use validation module)
    fun validate_share_amount(amount: u64) {
        use orbiter::validation;
        validation::validate_shares(amount);
    }

    /// Validate that total supply is positive (deprecated - use validation module)
    fun validate_total_supply(total_supply: u64) {
        use orbiter::validation;
        validation::validate_share_supply(total_supply);
    }

    /// Get or initialize balance for an address
    fun get_or_init_balance(balances: &mut Table<address, u64>, addr: address): u64 {
        if (table::contains(balances, addr)) {
            *table::borrow(balances, addr)
        } else {
            table::add(balances, addr, 0);
            0
        }
    }

    /// Update balance for an address
    fun update_balance(balances: &mut Table<address, u64>, addr: address, new_balance: u64) {
        if (table::contains(balances, addr)) {
            *table::borrow_mut(balances, addr) = new_balance;
        } else {
            table::add(balances, addr, new_balance);
        }
    }

    /// Get or initialize allowance table for owner
    fun get_or_init_owner_allowances(allowances: &mut Table<address, Table<address, u64>>, owner: address): &mut Table<address, u64> {
        if (!table::contains(allowances, owner)) {
            table::add(allowances, owner, table::new<address, u64>());
        };
        table::borrow_mut(allowances, owner)
    }

    /// Get allowance amount between owner and spender
    fun get_allowance_amount(owner_allowances: &Table<address, u64>, spender: address): u64 {
        if (table::contains(owner_allowances, spender)) {
            *table::borrow(owner_allowances, spender)
        } else {
            0
        }
    }

    /// Update allowance amount
    fun update_allowance(owner_allowances: &mut Table<address, u64>, spender: address, amount: u64) {
        if (table::contains(owner_allowances, spender)) {
            if (amount == 0) {
                table::remove(owner_allowances, spender);
            } else {
                *table::borrow_mut(owner_allowances, spender) = amount;
            }
        } else if (amount > 0) {
            table::add(owner_allowances, spender, amount);
        }
    }

    // ================================
    // Resource Initialization Functions
    // ================================

    /// Initialize share ownership resource for a domain object
    fun init_share_ownership(
        domain_owner: &signer,
        domain_obj: Object<DomainAsset>,
        total_supply: u64
    ) {
        let domain_addr = object::object_address(&domain_obj);
        
        // Ensure ShareOwnership doesn't already exist
        assert!(!exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        
        let domain_owner_addr = signer::address_of(domain_owner);
        
        // Create balances table and set initial balance for domain owner
        let balances = table::new<address, u64>();
        table::add(&mut balances, domain_owner_addr, total_supply);
        
        // Create ShareOwnership resource
        let share_ownership = ShareOwnership {
            domain_object: domain_obj,
            balances,
            total_shares: total_supply,
            transfer_event_count: 0,
        };
        
        // Move resource to domain object address
        move_to(domain_owner, share_ownership);
    }

    /// Initialize share allowance resource for a domain object
    fun init_share_allowance(
        domain_owner: &signer,
        domain_obj: Object<DomainAsset>
    ) {
        let domain_addr = object::object_address(&domain_obj);
        
        // Ensure ShareAllowance doesn't already exist
        assert!(!exists<ShareAllowance>(domain_addr), ESHARE_ALLOWANCE_NOT_INITIALIZED);
        
        // Create ShareAllowance resource
        let share_allowance = ShareAllowance {
            domain_object: domain_obj,
            allowances: table::new<address, Table<address, u64>>(),
        };
        
        // Move resource to domain object address
        move_to(domain_owner, share_allowance);
    }

    // ================================
    // Public Query Functions
    // ================================

    /// Check if share ownership is initialized for a domain
    public fun is_share_ownership_initialized(domain_obj: Object<DomainAsset>): bool {
        let domain_addr = object::object_address(&domain_obj);
        exists<ShareOwnership>(domain_addr)
    }

    /// Check if share allowance is initialized for a domain
    public fun is_share_allowance_initialized(domain_obj: Object<DomainAsset>): bool {
        let domain_addr = object::object_address(&domain_obj);
        exists<ShareAllowance>(domain_addr)
    }

    /// Get share balance for an address
    public fun get_share_balance(
        domain_obj: Object<DomainAsset>,
        owner: address
    ): u64 acquires ShareOwnership {
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        
        let share_ownership = borrow_global<ShareOwnership>(domain_addr);
        
        if (table::contains(&share_ownership.balances, owner)) {
            *table::borrow(&share_ownership.balances, owner)
        } else {
            0
        }
    }

    /// Get total supply of shares for a domain
    public fun get_total_supply(domain_obj: Object<DomainAsset>): u64 acquires ShareOwnership {
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        
        let share_ownership = borrow_global<ShareOwnership>(domain_addr);
        share_ownership.total_shares
    }

    /// Get allowance amount between owner and spender
    public fun get_allowance(
        domain_obj: Object<DomainAsset>,
        owner: address,
        spender: address
    ): u64 acquires ShareAllowance {
        let domain_addr = object::object_address(&domain_obj);
        
        if (!exists<ShareAllowance>(domain_addr)) {
            return 0
        };
        
        let share_allowance = borrow_global<ShareAllowance>(domain_addr);
        
        if (table::contains(&share_allowance.allowances, owner)) {
            let owner_allowances = table::borrow(&share_allowance.allowances, owner);
            get_allowance_amount(owner_allowances, spender)
        } else {
            0
        }
    }

    /// Get transfer event count for a domain
    public fun get_transfer_event_count(domain_obj: Object<DomainAsset>): u64 acquires ShareOwnership {
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        
        let share_ownership = borrow_global<ShareOwnership>(domain_addr);
        share_ownership.transfer_event_count
    }
 
   // ================================
    // Share Transfer and Balance Management Functions
    // ================================

    /// Transfer shares between addresses
    public fun transfer_shares(
        from: &signer,
        domain_obj: Object<DomainAsset>,
        to: address,
        amount: u64
    ) acquires ShareOwnership {
        use aptos_framework::timestamp;
        use orbiter::validation;
        use orbiter::security;
        
        let from_addr = signer::address_of(from);
        
        // Comprehensive input validation
        validation::validate_share_transfer_params(from_addr, to, amount);
        validation::validate_domain_object_exists(domain_obj);
        
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        
        // Check that fractional ownership is enabled for this domain
        let fractional_config = domain_registry::get_fractional_config(domain_obj);
        assert!(std::option::is_some(&fractional_config), EFRACTIONAL_NOT_ENABLED);
        let trading_enabled = domain_registry::is_trading_enabled(domain_obj);
        
        let share_ownership = borrow_global_mut<ShareOwnership>(domain_addr);
        
        // Get current balances
        let from_balance = get_or_init_balance(&mut share_ownership.balances, from_addr);
        let to_balance = get_or_init_balance(&mut share_ownership.balances, to);
        
        // Access control and security checks
        security::verify_share_transfer_access(from, from_addr, to, from_balance, amount, trading_enabled);
        
        // Reentrancy protection for critical balance updates
        security::acquire_reentrancy_lock(from);
        
        // Update balances
        let new_from_balance = from_balance - amount;
        let new_to_balance = to_balance + amount;
        
        update_balance(&mut share_ownership.balances, from_addr, new_from_balance);
        update_balance(&mut share_ownership.balances, to, new_to_balance);
        
        // Release reentrancy lock
        security::release_reentrancy_lock(from);
        
        // Increment transfer event count
        share_ownership.transfer_event_count = share_ownership.transfer_event_count + 1;
        let _event_id = share_ownership.transfer_event_count;
        
        let current_time = timestamp::now_seconds();
        
        // Emit share transfer event
        event::emit(SharesTransferred {
            domain_object: domain_addr,
            from: from_addr,
            to: to,
            amount: amount,
            from_balance: new_from_balance,
            to_balance: new_to_balance,
            timestamp: current_time,
        });
    }

    /// Approve third-party to transfer shares on behalf of owner
    public fun approve_shares(
        owner: &signer,
        domain_obj: Object<DomainAsset>,
        spender: address,
        amount: u64
    ) acquires ShareAllowance {
        use aptos_framework::timestamp;
        use orbiter::validation;
        
        let owner_addr = signer::address_of(owner);
        
        // Comprehensive input validation
        validation::validate_allowance_params(owner_addr, spender, amount);
        validation::validate_domain_object_exists(domain_obj);
        
        let domain_addr = object::object_address(&domain_obj);
        
        // Initialize ShareAllowance if it doesn't exist
        if (!exists<ShareAllowance>(domain_addr)) {
            // We need to get the domain owner to initialize the resource
            // For now, we'll assume the caller is authorized to initialize
            init_share_allowance(owner, domain_obj);
        };
        
        let share_allowance = borrow_global_mut<ShareAllowance>(domain_addr);
        
        // Get or initialize owner's allowance table
        let owner_allowances = get_or_init_owner_allowances(&mut share_allowance.allowances, owner_addr);
        
        // Update allowance
        update_allowance(owner_allowances, spender, amount);
        
        // Emit allowance set event
        event::emit(AllowanceSet {
            domain_object: domain_addr,
            owner: owner_addr,
            spender: spender,
            amount: amount,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Transfer shares on behalf of owner (with allowance)
    public fun transfer_from_shares(
        spender: &signer,
        domain_obj: Object<DomainAsset>,
        from: address,
        to: address,
        amount: u64
    ) acquires ShareOwnership, ShareAllowance {
        use aptos_framework::timestamp;
        use orbiter::validation;
        
        let spender_addr = signer::address_of(spender);
        
        // Comprehensive input validation
        validation::validate_address(spender_addr);
        validation::validate_share_transfer_params(from, to, amount);
        validation::validate_domain_object_exists(domain_obj);
        
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        assert!(exists<ShareAllowance>(domain_addr), ESHARE_ALLOWANCE_NOT_INITIALIZED);
        
        // Check that fractional ownership is enabled for this domain
        let fractional_config = domain_registry::get_fractional_config(domain_obj);
        assert!(std::option::is_some(&fractional_config), EFRACTIONAL_NOT_ENABLED);
        assert!(domain_registry::is_trading_enabled(domain_obj), EFRACTIONAL_NOT_ENABLED);
        
        // Check and update allowance
        let share_allowance = borrow_global_mut<ShareAllowance>(domain_addr);
        assert!(table::contains(&share_allowance.allowances, from), EINSUFFICIENT_ALLOWANCE);
        
        let owner_allowances = table::borrow_mut(&mut share_allowance.allowances, from);
        let current_allowance = get_allowance_amount(owner_allowances, spender_addr);
        assert!(current_allowance >= amount, EINSUFFICIENT_ALLOWANCE);
        
        // Update allowance
        let new_allowance = current_allowance - amount;
        update_allowance(owner_allowances, spender_addr, new_allowance);
        
        // Perform the transfer
        let share_ownership = borrow_global_mut<ShareOwnership>(domain_addr);
        
        // Get current balances
        let from_balance = get_or_init_balance(&mut share_ownership.balances, from);
        let to_balance = get_or_init_balance(&mut share_ownership.balances, to);
        
        // Validate sufficient balance
        assert!(from_balance >= amount, EINSUFFICIENT_SHARES);
        
        // Update balances
        let new_from_balance = from_balance - amount;
        let new_to_balance = to_balance + amount;
        
        update_balance(&mut share_ownership.balances, from, new_from_balance);
        update_balance(&mut share_ownership.balances, to, new_to_balance);
        
        // Increment transfer event count
        share_ownership.transfer_event_count = share_ownership.transfer_event_count + 1;
        
        let current_time = timestamp::now_seconds();
        
        // Emit share transfer event
        event::emit(SharesTransferred {
            domain_object: domain_addr,
            from: from,
            to: to,
            amount: amount,
            from_balance: new_from_balance,
            to_balance: new_to_balance,
            timestamp: current_time,
        });
    }

    /// Internal function to perform balance updates with comprehensive validation
    fun internal_transfer_shares(
        share_ownership: &mut ShareOwnership,
        from: address,
        to: address,
        amount: u64
    ): (u64, u64) {
        // Get current balances
        let from_balance = get_or_init_balance(&mut share_ownership.balances, from);
        let to_balance = get_or_init_balance(&mut share_ownership.balances, to);
        
        // Validate sufficient balance
        assert!(from_balance >= amount, EINSUFFICIENT_SHARES);
        
        // Calculate new balances
        let new_from_balance = from_balance - amount;
        let new_to_balance = to_balance + amount;
        
        // Update balances
        update_balance(&mut share_ownership.balances, from, new_from_balance);
        update_balance(&mut share_ownership.balances, to, new_to_balance);
        
        (new_from_balance, new_to_balance)
    }

    /// Batch transfer shares to multiple recipients
    public fun batch_transfer_shares(
        from: &signer,
        domain_obj: Object<DomainAsset>,
        recipients: vector<address>,
        amounts: vector<u64>
    ) acquires ShareOwnership {
        use aptos_framework::timestamp;
        use orbiter::validation;
        
        let from_addr = signer::address_of(from);
        
        // Comprehensive input validation
        validation::validate_address(from_addr);
        validation::validate_batch_transfer_params(&recipients, &amounts);
        validation::validate_domain_object_exists(domain_obj);
        
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        
        // Check that fractional ownership is enabled for this domain
        let fractional_config = domain_registry::get_fractional_config(domain_obj);
        assert!(std::option::is_some(&fractional_config), EFRACTIONAL_NOT_ENABLED);
        assert!(domain_registry::is_trading_enabled(domain_obj), EFRACTIONAL_NOT_ENABLED);
        
        let share_ownership = borrow_global_mut<ShareOwnership>(domain_addr);
        let current_time = timestamp::now_seconds();
        
        // Calculate total amount needed
        let amounts_len = std::vector::length(&amounts);
        let recipients_len = std::vector::length(&recipients);
        let total_amount = 0;
        let i = 0;
        while (i < amounts_len) {
            let amount = *std::vector::borrow(&amounts, i);
            validate_share_amount(amount);
            total_amount = total_amount + amount;
            i = i + 1;
        };
        
        // Check sender has sufficient balance for total transfer
        let from_balance = get_or_init_balance(&mut share_ownership.balances, from_addr);
        assert!(from_balance >= total_amount, EINSUFFICIENT_SHARES);
        
        // Perform all transfers
        i = 0;
        while (i < recipients_len) {
            let to = *std::vector::borrow(&recipients, i);
            let amount = *std::vector::borrow(&amounts, i);
            
            validate_address(to);
            assert!(from_addr != to, ESELF_TRANSFER);
            
            let (new_from_balance, new_to_balance) = internal_transfer_shares(
                share_ownership, 
                from_addr, 
                to, 
                amount
            );
            
            // Increment transfer event count
            share_ownership.transfer_event_count = share_ownership.transfer_event_count + 1;
            
            // Emit individual transfer event
            event::emit(SharesTransferred {
                domain_object: domain_addr,
                from: from_addr,
                to: to,
                amount: amount,
                from_balance: new_from_balance,
                to_balance: new_to_balance,
                timestamp: current_time,
            });
            
            i = i + 1;
        };
    }
    // ================================
    // Fractional Ownership Initialization and Configuration Functions
    // ================================

    /// Initialize fractional ownership for a domain
    public fun initialize_fractional_ownership(
        domain_owner: &signer,
        domain_obj: Object<DomainAsset>,
        total_supply: u64,
        ticker: std::string::String
    ) {
        use aptos_framework::timestamp;
        use orbiter::validation;
        use orbiter::security;
        
        let domain_owner_addr = signer::address_of(domain_owner);
        let domain_addr = object::object_address(&domain_obj);
        
        // Comprehensive input validation
        validation::validate_fractional_initialization_inputs(domain_owner_addr, total_supply, &ticker);
        validation::validate_domain_object_exists(domain_obj);
        
        // Access control and security checks
        security::verify_fractional_initialization_access(domain_owner, domain_obj);
        
        // Check that domain has fractional config
        let fractional_config = domain_registry::get_fractional_config(domain_obj);
        assert!(std::option::is_some(&fractional_config), EFRACTIONAL_NOT_ENABLED);
        
        // Initialize share ownership if not already done
        if (!exists<ShareOwnership>(domain_addr)) {
            init_share_ownership(domain_owner, domain_obj, total_supply);
        };
        
        // Initialize share allowance if not already done
        if (!exists<ShareAllowance>(domain_addr)) {
            init_share_allowance(domain_owner, domain_obj);
        };
        
        // Get domain name for event
        let (domain_name, _, _) = domain_registry::get_domain_info(domain_obj);
        
        // Emit initialization event
        event::emit(FractionalOwnershipInitialized {
            domain_object: domain_addr,
            domain_name: domain_name,
            owner: domain_owner_addr,
            total_supply: total_supply,
            ticker: ticker,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Entry wrapper: initialize fractional ownership by domain object address
    public entry fun initialize_fractional_ownership_entry(
        domain_owner: &signer,
        domain_object_addr: address,
        total_supply: u64,
        ticker: std::string::String
    ) {
        let domain_obj = object::address_to_object<DomainAsset>(domain_object_addr);
        initialize_fractional_ownership(domain_owner, domain_obj, total_supply, ticker);
    }

    /// Update fractional ownership configuration (domain owner only)
    public fun update_fractional_config(
        domain_owner: &signer,
        domain_obj: Object<DomainAsset>,
        new_ticker: std::string::String,
        _trading_enabled: bool
    ) {
        let domain_owner_addr = signer::address_of(domain_owner);
        
        // Validate inputs
        assert!(std::string::length(&new_ticker) > 0, EINVALID_SHARE_AMOUNT);
        assert!(std::string::length(&new_ticker) <= 10, EINVALID_SHARE_AMOUNT);
        
        // Verify the caller is the domain owner
        assert!(domain_registry::is_domain_owner(domain_obj, domain_owner_addr), EUNAUTHORIZED_DOMAIN_OWNER);
        
        // Note: The actual fractional config update would need to be implemented in domain_registry module
        // This function serves as a validation layer for fractional-specific updates
    }

    // ================================
    // Advanced Query Functions
    // ================================

    /// Get comprehensive share information for a domain
    public fun get_share_info(domain_obj: Object<DomainAsset>): (u64, u64, bool) acquires ShareOwnership {
        let domain_addr = object::object_address(&domain_obj);
        
        if (!exists<ShareOwnership>(domain_addr)) {
            return (0, 0, false)
        };
        
        let share_ownership = borrow_global<ShareOwnership>(domain_addr);
        let trading_enabled = domain_registry::is_trading_enabled(domain_obj);
        
        (
            share_ownership.total_shares,
            share_ownership.transfer_event_count,
            trading_enabled
        )
    }

    /// Get all share holders and their balances (limited to prevent gas issues)
    public fun get_share_holders(
        domain_obj: Object<DomainAsset>,
        limit: u64
    ): (vector<address>, vector<u64>) acquires ShareOwnership {
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        assert!(limit > 0 && limit <= 100, EINVALID_SHARE_AMOUNT); // Reasonable limit
        
        let _share_ownership = borrow_global<ShareOwnership>(domain_addr);
        
        // Note: This is a simplified implementation
        // In a production system, you'd want to maintain a separate index of holders
        let holders = std::vector::empty<address>();
        let balances = std::vector::empty<u64>();
        
        // For now, return empty vectors as we don't have iteration over tables
        // This would need to be implemented with additional data structures
        (holders, balances)
    }

    /// Calculate share percentage for an address
    public fun get_share_percentage(
        domain_obj: Object<DomainAsset>,
        owner: address
    ): u64 acquires ShareOwnership {
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        
        let share_ownership = borrow_global<ShareOwnership>(domain_addr);
        let total_shares = share_ownership.total_shares;
        
        // Get owner balance directly from the table to avoid double borrow
        let owner_balance = if (table::contains(&share_ownership.balances, owner)) {
            *table::borrow(&share_ownership.balances, owner)
        } else {
            0
        };
        
        if (total_shares == 0) {
            return 0
        };
        
        // Calculate percentage with 2 decimal precision (multiply by 10000)
        (owner_balance * 10000) / total_shares
    }

    /// Check if an address has any shares
    public fun has_shares(domain_obj: Object<DomainAsset>, owner: address): bool acquires ShareOwnership {
        get_share_balance(domain_obj, owner) > 0
    }

    /// Friend function for marketplace to transfer shares
    public(friend) fun transfer_shares_internal(
        domain_obj: Object<DomainAsset>,
        from: address,
        to: address,
        amount: u64
    ) acquires ShareOwnership {
        use aptos_framework::timestamp;
        
        let domain_addr = object::object_address(&domain_obj);
        assert!(exists<ShareOwnership>(domain_addr), ESHARE_OWNERSHIP_NOT_INITIALIZED);
        
        let share_ownership = borrow_global_mut<ShareOwnership>(domain_addr);
        
        let (new_from_balance, new_to_balance) = internal_transfer_shares(
            share_ownership,
            from,
            to,
            amount
        );
        
        // Increment transfer event count
        share_ownership.transfer_event_count = share_ownership.transfer_event_count + 1;
        
        // Emit share transfer event
        event::emit(SharesTransferred {
            domain_object: domain_addr,
            from,
            to,
            amount,
            from_balance: new_from_balance,
            to_balance: new_to_balance,
            timestamp: timestamp::now_seconds(),
        });
    }
}




