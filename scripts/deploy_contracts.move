script {
    use orbiter::domain_registry;
    use orbiter::marketplace;
    use orbiter::valuation;
    use std::signer;

    /// Deploy and initialize all ORBITER smart contracts
    /// This script should be run by the admin account
    fun deploy_contracts(admin: &signer) {
        // Initialize the domain registry
        domain_registry::initialize(admin);
        
        // Initialize the marketplace with 2.5% trading fee (250 basis points)
        // and admin as fee collector
        marketplace::initialize_marketplace(
            admin,
            250, // 2.5% trading fee
            signer::address_of(admin)
        );
        
        // Initialize valuation oracle system
        // Start with admin as the only oracle, requiring 1 vote for consensus
        let initial_oracles = vector[signer::address_of(admin)];
        valuation::initialize_valuation_oracle(
            admin,
            initial_oracles,
            1, // min_consensus
            3600 // update_frequency (1 hour in seconds)
        );
    }
}