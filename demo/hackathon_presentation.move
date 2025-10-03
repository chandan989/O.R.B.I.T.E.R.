script {
    use orbiter::demo_data;
    use orbiter::demo_scripts;
    use orbiter::domain_registry;
    use orbiter::marketplace;
    use orbiter::fractional;
    use std::signer;
    use std::vector;

    /// Complete hackathon presentation setup script
    /// This script prepares all demo data and scenarios for the live presentation
    fun hackathon_presentation_setup(presenter: &signer) {
        let presenter_addr = signer::address_of(presenter);
        
        // 1. Set up the complete demo environment
        demo_scripts::setup_complete_hackathon_demo(presenter);
        
        // 2. Create domains for live demo
        let domains = demo_data::create_demo_domains(presenter);
        
        // 3. Set up realistic trading scenarios
        demo_scripts::demo_high_frequency_trading(presenter, presenter, &domains);
        demo_scripts::demo_portfolio_diversification(presenter, &domains);
        demo_scripts::demo_market_making(presenter, &domains);
        
        // 4. Create the special "live" domain for on-stage tokenization
        demo_scripts::demo_live_tokenization(presenter);
        
        // The environment is now ready for the hackathon presentation!
    }
}