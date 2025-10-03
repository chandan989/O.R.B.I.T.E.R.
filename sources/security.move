module orbiter::security {
    use std::signer;
    use aptos_framework::object::Object;
    use orbiter::domain_registry::{Self, DomainAsset};

    // ================================
    // Error Codes for Security
    // ================================
    
    /// Access control errors
    const EUNAUTHORIZED_ACCESS: u64 = 200;
    const EUNAUTHORIZED_ADMIN: u64 = 201;
    const EUNAUTHORIZED_OWNER: u64 = 202;
    const EUNAUTHORIZED_ORACLE: u64 = 203;
    const EUNAUTHORIZED_SELLER: u64 = 204;
    const EREENTRANCY_DETECTED: u64 = 205;
    const ESYSTEM_PAUSED: u64 = 206;
    const EINVALID_CALLER: u64 = 207;
    const ESELF_OPERATION: u64 = 208;
    const EINSUFFICIENT_PRIVILEGES: u64 = 209;
    const EACCESS_DENIED: u64 = 210;

    // ================================
    // Reentrancy Protection
    // ================================

    /// Global reentrancy guard state
    struct ReentrancyGuard has key {
        /// Whether a function is currently executing
        locked: bool,
        /// Counter for nested calls detection
        call_depth: u64,
        /// Last caller address for tracking
        last_caller: address,
    }

    /// Initialize reentrancy guard (called once at deployment)
    public fun initialize_reentrancy_guard(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        // Ensure guard doesn't already exist
        assert!(!exists<ReentrancyGuard>(admin_addr), EREENTRANCY_DETECTED);
        
        let guard = ReentrancyGuard {
            locked: false,
            call_depth: 0,
            last_caller: @0x0,
        };
        
        move_to(admin, guard);
    }

    /// Acquire reentrancy lock before critical operations
    public fun acquire_reentrancy_lock(caller: &signer) acquires ReentrancyGuard {
        let caller_addr = signer::address_of(caller);
        
        if (!exists<ReentrancyGuard>(@orbiter)) {
            return // Guard not initialized, skip protection
        };
        
        let guard = borrow_global_mut<ReentrancyGuard>(@orbiter);
        
        // Check if already locked
        assert!(!guard.locked, EREENTRANCY_DETECTED);
        
        // Acquire lock
        guard.locked = true;
        guard.call_depth = guard.call_depth + 1;
        guard.last_caller = caller_addr;
    }

    /// Release reentrancy lock after critical operations
    public fun release_reentrancy_lock(caller: &signer) acquires ReentrancyGuard {
        let caller_addr = signer::address_of(caller);
        
        if (!exists<ReentrancyGuard>(@orbiter)) {
            return // Guard not initialized, skip protection
        };
        
        let guard = borrow_global_mut<ReentrancyGuard>(@orbiter);
        
        // Verify caller is the one who acquired the lock
        assert!(guard.last_caller == caller_addr, EREENTRANCY_DETECTED);
        assert!(guard.call_depth > 0, EREENTRANCY_DETECTED);
        
        // Release lock
        guard.locked = false;
        guard.call_depth = guard.call_depth - 1;
        guard.last_caller = @0x0;
    }

    /// Check if reentrancy guard is locked
    public fun is_reentrancy_locked(): bool acquires ReentrancyGuard {
        if (!exists<ReentrancyGuard>(@orbiter)) {
            return false
        };
        
        let guard = borrow_global<ReentrancyGuard>(@orbiter);
        guard.locked
    }

    // ================================
    // Access Control Functions
    // ================================

    /// Verify caller is a system admin
    public fun verify_admin_access(caller: &signer, expected_admin: address) {
        let caller_addr = signer::address_of(caller);
        assert!(caller_addr == expected_admin, EUNAUTHORIZED_ADMIN);
    }

    /// Verify caller owns the specified domain
    public fun verify_domain_owner_access(caller: &signer, domain_obj: Object<DomainAsset>) {
        let caller_addr = signer::address_of(caller);
        assert!(domain_registry::is_domain_owner(domain_obj, caller_addr), EUNAUTHORIZED_OWNER);
    }

    /// Verify caller is authorized to perform oracle operations
    public fun verify_oracle_access(caller: &signer, authorized_oracles: &vector<address>) {
        let caller_addr = signer::address_of(caller);
        assert!(std::vector::contains(authorized_oracles, &caller_addr), EUNAUTHORIZED_ORACLE);
    }

    /// Verify caller is not performing self-operations where prohibited
    public fun verify_no_self_operation(caller_addr: address, target_addr: address) {
        assert!(caller_addr != target_addr, ESELF_OPERATION);
    }

    /// Verify system is not paused
    public fun verify_system_not_paused(is_paused: bool) {
        assert!(!is_paused, ESYSTEM_PAUSED);
    }

    /// Verify caller has sufficient balance for operation
    public fun verify_sufficient_balance(current_balance: u64, required_amount: u64) {
        assert!(current_balance >= required_amount, EINSUFFICIENT_PRIVILEGES);
    }

    /// Verify caller has sufficient allowance for operation
    public fun verify_sufficient_allowance(current_allowance: u64, required_amount: u64) {
        assert!(current_allowance >= required_amount, EINSUFFICIENT_PRIVILEGES);
    }

    // ================================
    // Domain-Specific Access Control
    // ================================

    /// Verify caller can create domains (basic access control)
    public fun verify_domain_creation_access(caller: &signer) {
        let _caller_addr = signer::address_of(caller);
        // For now, anyone can create domains
        // In the future, this could be restricted to verified users
    }

    /// Verify caller can transfer domain ownership
    public fun verify_domain_transfer_access(
        caller: &signer,
        domain_obj: Object<DomainAsset>,
        new_owner: address
    ) {
        let caller_addr = signer::address_of(caller);
        
        // Verify caller owns the domain
        verify_domain_owner_access(caller, domain_obj);
        
        // Verify not transferring to self
        verify_no_self_operation(caller_addr, new_owner);
    }

    /// Verify caller can update domain valuation
    public fun verify_valuation_update_access(
        caller: &signer,
        admin_addr: address,
        is_system_paused: bool
    ) {
        // Verify admin access
        verify_admin_access(caller, admin_addr);
        
        // Verify system is not paused
        verify_system_not_paused(is_system_paused);
    } 
   // ================================
    // Fractional Ownership Access Control
    // ================================

    /// Verify caller can initialize fractional ownership
    public fun verify_fractional_initialization_access(
        caller: &signer,
        domain_obj: Object<DomainAsset>
    ) {
        // Verify caller owns the domain
        verify_domain_owner_access(caller, domain_obj);
    }

    /// Verify caller can transfer shares
    public fun verify_share_transfer_access(
        caller: &signer,
        from_addr: address,
        to_addr: address,
        caller_balance: u64,
        transfer_amount: u64,
        trading_enabled: bool
    ) {
        let caller_addr = signer::address_of(caller);
        
        // Verify caller is the from address (owns the shares)
        assert!(caller_addr == from_addr, EUNAUTHORIZED_ACCESS);
        
        // Verify not transferring to self
        verify_no_self_operation(from_addr, to_addr);
        
        // Verify sufficient balance
        verify_sufficient_balance(caller_balance, transfer_amount);
        
        // Verify trading is enabled
        assert!(trading_enabled, ESYSTEM_PAUSED);
    }

    /// Verify caller can approve share allowances
    public fun verify_share_approval_access(
        caller: &signer,
        spender_addr: address
    ) {
        let caller_addr = signer::address_of(caller);
        
        // Verify not approving self
        verify_no_self_operation(caller_addr, spender_addr);
    }

    /// Verify caller can transfer shares on behalf of owner
    public fun verify_share_transfer_from_access(
        caller: &signer,
        from_addr: address,
        to_addr: address,
        current_allowance: u64,
        transfer_amount: u64,
        trading_enabled: bool
    ) {
        let caller_addr = signer::address_of(caller);
        
        // Verify not transferring to self
        verify_no_self_operation(from_addr, to_addr);
        
        // Verify caller is not the from address (must use allowance)
        assert!(caller_addr != from_addr, EUNAUTHORIZED_ACCESS);
        
        // Verify sufficient allowance
        verify_sufficient_allowance(current_allowance, transfer_amount);
        
        // Verify trading is enabled
        assert!(trading_enabled, ESYSTEM_PAUSED);
    }   
 // ================================
    // Marketplace Access Control
    // ================================

    /// Verify caller can create marketplace listings
    public fun verify_listing_creation_access(
        _caller: &signer,
        domain_obj: Object<DomainAsset>,
        shares_to_sell: u64,
        caller_balance: u64,
        is_marketplace_paused: bool
    ) {
        // Verify system is not paused
        verify_system_not_paused(is_marketplace_paused);
        
        // Verify caller has sufficient shares to list
        verify_sufficient_balance(caller_balance, shares_to_sell);
        
        // Verify trading is enabled for the domain
        assert!(domain_registry::is_trading_enabled(domain_obj), ESYSTEM_PAUSED);
    }

    /// Verify caller can cancel marketplace listings
    public fun verify_listing_cancellation_access(
        caller: &signer,
        listing_seller: address,
        is_listing_active: bool
    ) {
        let caller_addr = signer::address_of(caller);
        
        // Verify caller is the seller
        assert!(caller_addr == listing_seller, EUNAUTHORIZED_SELLER);
        
        // Verify listing is active
        assert!(is_listing_active, EACCESS_DENIED);
    }

    /// Verify caller can update listing prices
    public fun verify_listing_update_access(
        caller: &signer,
        listing_seller: address,
        is_listing_active: bool
    ) {
        let caller_addr = signer::address_of(caller);
        
        // Verify caller is the seller
        assert!(caller_addr == listing_seller, EUNAUTHORIZED_SELLER);
        
        // Verify listing is active
        assert!(is_listing_active, EACCESS_DENIED);
    }

    /// Verify caller can execute trades
    public fun verify_trade_execution_access(
        caller: &signer,
        seller_addr: address,
        shares_to_buy: u64,
        total_cost: u64,
        shares_available: u64,
        is_marketplace_paused: bool,
        is_listing_active: bool
    ) {
        let caller_addr = signer::address_of(caller);
        
        // Verify system is not paused
        verify_system_not_paused(is_marketplace_paused);
        
        // Verify listing is active
        assert!(is_listing_active, EACCESS_DENIED);
        
        // Verify not buying from self
        verify_no_self_operation(caller_addr, seller_addr);
        
        // Verify sufficient shares available
        verify_sufficient_balance(shares_available, shares_to_buy);
        
        // Note: Payment verification would be handled by the coin module
        // We assume the caller has sufficient funds for total_cost
        assert!(total_cost > 0, EINSUFFICIENT_PRIVILEGES);
    }   
 // ================================
    // Oracle Access Control
    // ================================

    /// Verify caller can submit valuation updates
    public fun verify_valuation_submission_access(
        caller: &signer,
        authorized_oracles: &vector<address>,
        is_oracle_paused: bool,
        can_update_domain: bool
    ) {
        // Verify oracle access
        verify_oracle_access(caller, authorized_oracles);
        
        // Verify oracle system is not paused
        verify_system_not_paused(is_oracle_paused);
        
        // Verify domain can be updated (frequency check)
        assert!(can_update_domain, EACCESS_DENIED);
    }

    /// Verify caller can vote on valuations
    public fun verify_valuation_vote_access(
        caller: &signer,
        authorized_oracles: &vector<address>,
        voted_oracles: &vector<address>,
        is_oracle_paused: bool
    ) {
        let caller_addr = signer::address_of(caller);
        
        // Verify oracle access
        verify_oracle_access(caller, authorized_oracles);
        
        // Verify oracle system is not paused
        verify_system_not_paused(is_oracle_paused);
        
        // Verify oracle hasn't already voted
        assert!(!std::vector::contains(voted_oracles, &caller_addr), EACCESS_DENIED);
    }

    /// Verify caller can manage oracle system
    public fun verify_oracle_management_access(
        caller: &signer,
        oracle_admin: address
    ) {
        // Verify admin access
        verify_admin_access(caller, oracle_admin);
    }

    // ================================
    // Administrative Access Control
    // ================================

    /// Verify caller can pause/unpause systems
    public fun verify_pause_access(caller: &signer, admin_addr: address) {
        verify_admin_access(caller, admin_addr);
    }

    /// Verify caller can update system settings
    public fun verify_settings_update_access(caller: &signer, admin_addr: address) {
        verify_admin_access(caller, admin_addr);
    }

    /// Verify caller can transfer admin privileges
    public fun verify_admin_transfer_access(
        caller: &signer,
        current_admin: address,
        new_admin: address
    ) {
        let caller_addr = signer::address_of(caller);
        
        // Verify caller is current admin
        assert!(caller_addr == current_admin, EUNAUTHORIZED_ADMIN);
        
        // Verify not transferring to self
        verify_no_self_operation(current_admin, new_admin);
    }

    /// Emergency pause all operations (super admin only)
    public fun emergency_pause(caller: &signer, super_admin: address) {
        verify_admin_access(caller, super_admin);
        // This would trigger pause across all modules
        // Implementation would depend on specific emergency procedures
    }

    /// Verify emergency access
    public fun verify_emergency_access(caller: &signer, super_admin: address) {
        verify_admin_access(caller, super_admin);
    }
}