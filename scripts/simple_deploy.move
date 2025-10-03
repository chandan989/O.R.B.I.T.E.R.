script {
    use orbiter::domain_registry;
    use orbiter::marketplace;
    use orbiter::valuation;

    /// Simple deployment script for hackathon demo
    fun simple_deploy(admin: &signer) {
        // Initialize domain registry
        domain_registry::initialize(admin);
        
        // Initialize marketplace with 2.5% trading fee (250 basis points)
        let trading_fee_bps = 250;
        let fee_collector = @orbiter;
        marketplace::initialize_marketplace(admin, trading_fee_bps, fee_collector);
        
        // Initialize valuation oracle with minimal setup
        let initial_oracles = vector[@orbiter];
        let min_consensus = 1;
        let update_frequency = 3600; // 1 hour
        valuation::initialize_valuation_oracle(admin, initial_oracles, min_consensus, update_frequency);
    }
}