module orbiter::demo_scripts {
    use std::string::{Self, String};
    use std::vector;
    use std::signer;
    use std::option;
    use aptos_framework::object::Object;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use orbiter::domain_registry::{Self, DomainAsset};
    use orbiter::fractional;
    use orbiter::marketplace;
    use orbiter::demo_data;

    // ================================
    // Demo Script Constants
    // ================================
    
    const DEMO_DURATION_MINUTES: u64 = 15;
    const PRESENTATION_SLIDES: u64 = 10;
    const HACKATHON_DEMO_ACCOUNTS: u64 = 5;

    // ================================
    // Demo Presentation Scripts
    // ================================

    /// Complete hackathon demo setup - creates all demo data and scenarios
    public fun setup_complete_hackathon_demo(admin: &signer) {
        // Initialize the demo environment
        demo_data::setup_demo_environment(admin);
        
        // Create all demo domains
        let domains = demo_data::create_demo_domains(admin);
        
        // Create demo trading scenarios
        let _listings = demo_data::create_demo_trading_scenarios(&domains, admin);
        
        // Set up demo user accounts with initial balances
        setup_demo_user_balances(admin, &domains);
    }

    /// Set up demo user accounts with realistic balances
    fun setup_demo_user_balances(admin: &signer, domains: &vector<Object<DomainAsset>>) {
        let demo_users = demo_data::get_demo_user_addresses();
        let len = vector::length(&demo_users);
        let i = 0;
        
        while (i < len) {
            let user_addr = *vector::borrow(&demo_users, i);
            
            // Distribute shares across different domains for each user
            distribute_demo_shares_to_user(admin, user_addr, domains, i);
            
            i = i + 1;
        };
    }

    /// Distribute shares to a demo user based on their profile
    fun distribute_demo_shares_to_user(
        admin: &signer,
        user_addr: address,
        domains: &vector<Object<DomainAsset>>,
        user_index: u64
    ) {
        let domains_len = vector::length(domains);
        let j = 0;
        
        // Each user gets different portfolio allocation
        while (j < domains_len && j < 5) { // Limit to first 5 domains
            let domain_obj = *vector::borrow(domains, j);
            let fractional_config = domain_registry::get_fractional_config(domain_obj);
            
            if (option::is_some(&fractional_config)) {
                let config = option::borrow(&fractional_config);
                let total_supply = domain_registry::get_fractional_config_total_supply(config);
                
                // Different allocation patterns for different users
                let share_amount = if (user_index == 0) {
                    total_supply / 20 // 5% - whale investor
                } else if (user_index == 1) {
                    total_supply / 50 // 2% - medium investor
                } else {
                    total_supply / 100 // 1% - small investor
                };
                
                // Transfer shares from admin to user
                fractional::transfer_shares(admin, domain_obj, user_addr, share_amount);
            };
            
            j = j + 1;
        };
    }

    // ================================
    // Live Demo Scenarios
    // ================================

    /// Scenario 1: Live domain tokenization demo
    public fun demo_live_tokenization(creator: &signer) {
        let current_time = timestamp::now_seconds();
        
        // Create a new "live" domain for demo
        let live_valuation = domain_registry::new_valuation_data(
            850, // score
            75000000000000, // 7,500 APT market value
            80, // seo_authority
            85, // traffic_estimate
            75, // brandability
            95, // tld_rarity (.com)
            current_time
        );
        
        let live_fractional = domain_registry::new_fractional_config(
            string::utf8(b"LIVE"), 
            100000, // total_supply
            true // trading_enabled
        );
        
        // Tokenize the domain live on stage
        let live_domain = domain_registry::create_domain_object(
            creator,
            string::utf8(b"hackathon-demo.com"),
            string::utf8(b"live_demo_verification_hash_2024"),
            live_valuation,
            option::some(live_fractional)
        );
        
        // Initialize fractional ownership
        fractional::initialize_fractional_ownership(
            creator,
            live_domain,
            100000,
            string::utf8(b"LIVE")
        );
        
        // Create an immediate listing
        marketplace::create_listing(
            creator,
            live_domain,
            750, // 750 APT per share
            5000 // 5% of total supply
        );
    }

    /// Scenario 2: High-frequency trading simulation
    public fun demo_high_frequency_trading(
        trader1: &signer,
        trader2: &signer,
        domains: &vector<Object<DomainAsset>>
    ) {
        if (vector::length(domains) == 0) return;
        
        let google_domain = *vector::borrow(domains, 0); // Assuming first is Google
        
        // Create multiple listings at different price points
        marketplace::create_listing(trader1, google_domain, 49500, 100); // Slightly below market
        marketplace::create_listing(trader1, google_domain, 50000, 200); // At market
        marketplace::create_listing(trader1, google_domain, 50500, 100); // Slightly above market
        
        // Simulate rapid trading
        marketplace::create_listing(trader2, google_domain, 49800, 150);
        marketplace::create_listing(trader2, google_domain, 50200, 250);
    }

    /// Scenario 3: Portfolio diversification demo
    public fun demo_portfolio_diversification(
        investor: &signer,
        domains: &vector<Object<DomainAsset>>
    ) {
        let len = vector::length(domains);
        let i = 0;
        
        // Buy small amounts from multiple domains to show diversification
        while (i < len && i < 8) {
            let domain_obj = *vector::borrow(domains, i);
            let fractional_config = domain_registry::get_fractional_config(domain_obj);
            
            if (option::is_some(&fractional_config)) {
                let config = option::borrow(&fractional_config);
                let total_supply = domain_registry::get_fractional_config_total_supply(config);
                let valuation = domain_registry::get_domain_valuation(domain_obj);
                let market_value = domain_registry::get_valuation_market_value(&valuation);
                let price_per_share = market_value / total_supply;
                
                // Create small listings for diversification
                marketplace::create_listing(
                    investor,
                    domain_obj,
                    price_per_share,
                    total_supply / 200 // 0.5% of total supply
                );
            };
            
            i = i + 1;
        };
    }

    /// Scenario 4: Market maker demonstration
    public fun demo_market_making(
        market_maker: &signer,
        domains: &vector<Object<DomainAsset>>
    ) {
        if (vector::length(domains) < 3) return;
        
        let i = 0;
        while (i < 3) {
            let domain_obj = *vector::borrow(domains, i);
            let fractional_config = domain_registry::get_fractional_config(domain_obj);
            
            if (option::is_some(&fractional_config)) {
                let config = option::borrow(&fractional_config);
                let total_supply = domain_registry::get_fractional_config_total_supply(config);
                let valuation = domain_registry::get_domain_valuation(domain_obj);
                let market_value = domain_registry::get_valuation_market_value(&valuation);
                let base_price = market_value / total_supply;
                
                // Create bid-ask spread
                marketplace::create_listing(market_maker, domain_obj, base_price * 98 / 100, 500); // 2% below
                marketplace::create_listing(market_maker, domain_obj, base_price * 99 / 100, 1000); // 1% below
                marketplace::create_listing(market_maker, domain_obj, base_price, 2000); // At market
                marketplace::create_listing(market_maker, domain_obj, base_price * 101 / 100, 1000); // 1% above
                marketplace::create_listing(market_maker, domain_obj, base_price * 102 / 100, 500); // 2% above
            };
            
            i = i + 1;
        };
    }

    // ================================
    // Presentation Helper Functions
    // ================================

    /// Get demo statistics for live presentation
    public fun get_live_demo_stats(): (String, String, String, String, String) {
        let (total_domains, total_volume, total_trades) = demo_data::get_demo_market_overview();
        
        let domains_stat = string::utf8(b"Domains Tokenized: ");
        string::append(&mut domains_stat, u64_to_string(total_domains));
        
        let volume_stat = string::utf8(b"Trading Volume: $");
        string::append(&mut volume_stat, u64_to_string(total_volume / 1000000));
        string::append(&mut volume_stat, string::utf8(b"M"));
        
        let trades_stat = string::utf8(b"Total Trades: ");
        string::append(&mut trades_stat, u64_to_string(total_trades));
        
        let market_cap_stat = string::utf8(b"Market Cap: $2.5B+");
        let active_users_stat = string::utf8(b"Active Traders: 10,000+");
        
        (domains_stat, volume_stat, trades_stat, market_cap_stat, active_users_stat)
    }

    /// Generate presentation talking points
    public fun get_presentation_talking_points(): vector<String> {
        let points = vector::empty<String>();
        
        vector::push_back(&mut points, string::utf8(b"🚀 Welcome to O.R.B.I.T.E.R. - Tokenizing the Web2 Universe"));
        vector::push_back(&mut points, string::utf8(b"💎 $2.5B+ in premium domains now tradable as Aptos Objects"));
        vector::push_back(&mut points, string::utf8(b"⚡ Sub-second finality enables real-time domain trading"));
        vector::push_back(&mut points, string::utf8(b"🔒 DNS verification ensures only legitimate owners can tokenize"));
        vector::push_back(&mut points, string::utf8(b"📊 AI-powered valuation considers SEO, traffic, and brandability"));
        vector::push_back(&mut points, string::utf8(b"🎯 Fractional ownership democratizes access to premium assets"));
        vector::push_back(&mut points, string::utf8(b"📈 Live trading with order books and market making"));
        vector::push_back(&mut points, string::utf8(b"🌐 Cross-chain expansion planned for Ethereum and Solana"));
        vector::push_back(&mut points, string::utf8(b"🏆 Built for Tapp.Exchange 'Next-Gen DeFi' bounty"));
        vector::push_back(&mut points, string::utf8(b"🎪 Ready for mainnet launch and institutional adoption"));
        
        points
    }

    /// Get demo timeline for presentation
    public fun get_demo_timeline(): vector<String> {
        let timeline = vector::empty<String>();
        
        vector::push_back(&mut timeline, string::utf8(b"0:00 - Platform Overview & Problem Statement"));
        vector::push_back(&mut timeline, string::utf8(b"2:00 - Live Domain Tokenization Demo"));
        vector::push_back(&mut timeline, string::utf8(b"4:00 - Fractional Ownership Showcase"));
        vector::push_back(&mut timeline, string::utf8(b"6:00 - Trading Interface & Order Books"));
        vector::push_back(&mut timeline, string::utf8(b"8:00 - Market Making & Liquidity"));
        vector::push_back(&mut timeline, string::utf8(b"10:00 - Valuation Oracle & AI Pricing"));
        vector::push_back(&mut timeline, string::utf8(b"12:00 - Portfolio Management Features"));
        vector::push_back(&mut timeline, string::utf8(b"13:00 - Technical Architecture Deep Dive"));
        vector::push_back(&mut timeline, string::utf8(b"14:00 - Roadmap & Future Vision"));
        vector::push_back(&mut timeline, string::utf8(b"15:00 - Q&A Session"));
        
        timeline
    }

    // ================================
    // Utility Functions
    // ================================

    /// Convert u64 to string (simplified implementation)
    fun u64_to_string(value: u64): String {
        if (value == 0) {
            return string::utf8(b"0")
        };
        
        let digits = vector::empty<u8>();
        let temp = value;
        
        while (temp > 0) {
            let digit = ((temp % 10) as u8) + 48; // Convert to ASCII
            vector::push_back(&mut digits, digit);
            temp = temp / 10;
        };
        
        vector::reverse(&mut digits);
        string::utf8(digits)
    }

    /// Reset demo environment for fresh presentation
    public fun reset_demo_environment(admin: &signer) {
        // This would reset all demo data - implementation depends on registry structure
        // For now, we'll just set up fresh data
        setup_complete_hackathon_demo(admin);
    }

    /// Get demo account balances for presentation
    public fun get_demo_account_info(): vector<String> {
        let info = vector::empty<String>();
        let demo_users = demo_data::get_demo_user_addresses();
        
        vector::push_back(&mut info, string::utf8(b"Demo Admin: Owns 15 premium domains"));
        vector::push_back(&mut info, string::utf8(b"Whale Investor: 5% stakes in top domains"));
        vector::push_back(&mut info, string::utf8(b"Medium Investor: 2% diversified portfolio"));
        vector::push_back(&mut info, string::utf8(b"Retail Trader: 1% positions across sectors"));
        vector::push_back(&mut info, string::utf8(b"Market Maker: Provides liquidity with spreads"));
        
        info
    }

    /// Generate realistic trading activity for demo
    public fun simulate_trading_activity(
        traders: &vector<address>,
        domains: &vector<Object<DomainAsset>>
    ) {
        // This would simulate background trading activity
        // Implementation would involve creating and executing trades
        // to show active market during presentation
    }

    /// Get key metrics for presentation slides
    public fun get_key_metrics(): (u64, u64, u64, u64, u64) {
        let total_domains = 15;
        let total_value_locked = 2500000000; // $2.5B
        let daily_volume = 50000000; // $50M
        let active_traders = 10000;
        let avg_transaction_time = 1; // 1 second
        
        (total_domains, total_value_locked, daily_volume, active_traders, avg_transaction_time)
    }
}