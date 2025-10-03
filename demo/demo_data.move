module orbiter::demo_data {
    use std::string::{Self, String};
    use std::vector;
    use std::option;
    use aptos_framework::object::Object;
    use aptos_framework::timestamp;
    use orbiter::domain_registry::{Self, DomainAsset, ValuationData, FractionalConfig};
    use orbiter::fractional;
    use orbiter::marketplace;
    use orbiter::valuation;

    // ================================
    // Demo Configuration
    // ================================
    
    /// Demo account addresses (for testing)
    const DEMO_ADMIN: address = @0x1234567890abcdef1234567890abcdef12345678;
    const DEMO_USER_1: address = @0xabcdef1234567890abcdef1234567890abcdef12;
    const DEMO_USER_2: address = @0x567890abcdef1234567890abcdef1234567890ab;
    const DEMO_USER_3: address = @0xcdef1234567890abcdef1234567890abcdef1234;

    // ================================
    // Demo Domain Data
    // ================================

    /// Sample domain names for demo
    public fun get_demo_domain_names(): vector<String> {
        let domains = vector::empty<String>();
        
        // High-value domains
        vector::push_back(&mut domains, string::utf8(b"google.com"));
        vector::push_back(&mut domains, string::utf8(b"amazon.com"));
        vector::push_back(&mut domains, string::utf8(b"microsoft.com"));
        vector::push_back(&mut domains, string::utf8(b"apple.com"));
        vector::push_back(&mut domains, string::utf8(b"meta.com"));
        
        // Medium-value domains
        vector::push_back(&mut domains, string::utf8(b"blockchain.com"));
        vector::push_back(&mut domains, string::utf8(b"crypto.com"));
        vector::push_back(&mut domains, string::utf8(b"defi.com"));
        vector::push_back(&mut domains, string::utf8(b"nft.com"));
        vector::push_back(&mut domains, string::utf8(b"web3.com"));
        
        // Emerging domains
        vector::push_back(&mut domains, string::utf8(b"ai-startup.com"));
        vector::push_back(&mut domains, string::utf8(b"quantum-tech.com"));
        vector::push_back(&mut domains, string::utf8(b"green-energy.org"));
        vector::push_back(&mut domains, string::utf8(b"space-ventures.net"));
        vector::push_back(&mut domains, string::utf8(b"biotech-innovations.com"));
        
        domains
    }

    /// Generate demo verification hashes
    public fun get_demo_verification_hashes(): vector<String> {
        let hashes = vector::empty<String>();
        
        vector::push_back(&mut hashes, string::utf8(b"a1b2c3d4e5f6789012345678901234567890abcdef"));
        vector::push_back(&mut hashes, string::utf8(b"b2c3d4e5f6789012345678901234567890abcdef12"));
        vector::push_back(&mut hashes, string::utf8(b"c3d4e5f6789012345678901234567890abcdef1234"));
        vector::push_back(&mut hashes, string::utf8(b"d4e5f6789012345678901234567890abcdef123456"));
        vector::push_back(&mut hashes, string::utf8(b"e5f6789012345678901234567890abcdef12345678"));
        vector::push_back(&mut hashes, string::utf8(b"f6789012345678901234567890abcdef1234567890"));
        vector::push_back(&mut hashes, string::utf8(b"789012345678901234567890abcdef1234567890ab"));
        vector::push_back(&mut hashes, string::utf8(b"89012345678901234567890abcdef1234567890abc"));
        vector::push_back(&mut hashes, string::utf8(b"9012345678901234567890abcdef1234567890abcd"));
        vector::push_back(&mut hashes, string::utf8(b"012345678901234567890abcdef1234567890abcde"));
        vector::push_back(&mut hashes, string::utf8(b"12345678901234567890abcdef1234567890abcdef"));
        vector::push_back(&mut hashes, string::utf8(b"2345678901234567890abcdef1234567890abcdef1"));
        vector::push_back(&mut hashes, string::utf8(b"345678901234567890abcdef1234567890abcdef12"));
        vector::push_back(&mut hashes, string::utf8(b"45678901234567890abcdef1234567890abcdef123"));
        vector::push_back(&mut hashes, string::utf8(b"5678901234567890abcdef1234567890abcdef1234"));
        
        hashes
    }

    /// Generate demo valuation data
    public fun create_demo_valuations(): vector<ValuationData> {
        let valuations = vector::empty<ValuationData>();
        let current_time = timestamp::now_seconds();
        
        // High-value domain valuations (google.com, amazon.com, etc.)
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            950, // score
            500000000000000, // 50,000 APT market value
            95, // seo_authority
            98, // traffic_estimate
            90, // brandability
            95, // tld_rarity (.com)
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            940,
            450000000000000, // 45,000 APT
            92,
            96,
            88,
            95,
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            930,
            400000000000000, // 40,000 APT
            90,
            94,
            85,
            95,
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            920,
            350000000000000, // 35,000 APT
            88,
            92,
            82,
            95,
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            910,
            300000000000000, // 30,000 APT
            85,
            90,
            80,
            95,
            current_time
        ));
        
        // Medium-value domain valuations (blockchain.com, crypto.com, etc.)
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            750,
            50000000000000, // 5,000 APT
            75,
            80,
            70,
            95,
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            740,
            45000000000000, // 4,500 APT
            72,
            78,
            68,
            95,
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            730,
            40000000000000, // 4,000 APT
            70,
            75,
            65,
            95,
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            720,
            35000000000000, // 3,500 APT
            68,
            72,
            62,
            95,
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            710,
            30000000000000, // 3,000 APT
            65,
            70,
            60,
            95,
            current_time
        ));
        
        // Emerging domain valuations
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            550,
            5000000000000, // 500 APT
            55,
            60,
            50,
            95,
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            540,
            4500000000000, // 450 APT
            52,
            58,
            48,
            95,
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            530,
            4000000000000, // 400 APT
            50,
            55,
            45,
            80, // .org
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            520,
            3500000000000, // 350 APT
            48,
            52,
            42,
            70, // .net
            current_time
        ));
        
        vector::push_back(&mut valuations, domain_registry::new_valuation_data(
            510,
            3000000000000, // 300 APT
            45,
            50,
            40,
            95,
            current_time
        ));
        
        valuations
    }

    /// Generate demo fractional configurations
    public fun create_demo_fractional_configs(): vector<option::Option<FractionalConfig>> {
        let configs = vector::empty<option::Option<FractionalConfig>>();
        
        // High-value domains with fractional ownership
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"GOOGL"), 1000000, true
        )));
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"AMZN"), 1000000, true
        )));
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"MSFT"), 1000000, true
        )));
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"AAPL"), 1000000, true
        )));
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"META"), 1000000, true
        )));
        
        // Medium-value domains
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"BLKC"), 500000, true
        )));
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"CRYP"), 500000, true
        )));
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"DEFI"), 500000, true
        )));
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"NFTS"), 500000, true
        )));
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"WEB3"), 500000, true
        )));
        
        // Emerging domains - some without fractional ownership
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"AIST"), 100000, true
        )));
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"QTECH"), 100000, true
        )));
        
        vector::push_back(&mut configs, option::none()); // green-energy.org - no fractional
        
        vector::push_back(&mut configs, option::some(domain_registry::new_fractional_config(
            string::utf8(b"SPACE"), 100000, true
        )));
        
        vector::push_back(&mut configs, option::none()); // biotech-innovations.com - no fractional
        
        configs
    }

    // ================================
    // Demo Setup Functions
    // ================================

    /// Initialize demo environment
    public fun setup_demo_environment(admin: &signer) {
        // Initialize all systems
        domain_registry::initialize(admin);
        marketplace::initialize_marketplace(admin, 250, @orbiter); // 2.5% fee
        valuation::initialize_valuation_oracle(
            admin,
            vector[@orbiter], // Single oracle for demo
            1, // min consensus
            3600 // 1 hour update frequency
        );
    }

    /// Create all demo domains
    public fun create_demo_domains(creator: &signer): vector<Object<DomainAsset>> {
        let domain_names = get_demo_domain_names();
        let verification_hashes = get_demo_verification_hashes();
        let valuations = create_demo_valuations();
        let fractional_configs = create_demo_fractional_configs();
        
        let created_domains = vector::empty<Object<DomainAsset>>();
        let len = vector::length(&domain_names);
        let i = 0;
        
        while (i < len) {
            let domain_name = *vector::borrow(&domain_names, i);
            let verification_hash = *vector::borrow(&verification_hashes, i);
            let valuation = *vector::borrow(&valuations, i);
            let fractional_config = *vector::borrow(&fractional_configs, i);
            
            let domain_obj = domain_registry::create_domain_object(
                creator,
                domain_name,
                verification_hash,
                valuation,
                fractional_config
            );
            
            // Initialize fractional ownership if configured
            if (option::is_some(&fractional_config)) {
                let config = option::borrow(&fractional_config);
                let ticker = domain_registry::get_fractional_config_ticker(config);
                let total_supply = domain_registry::get_fractional_config_total_supply(config);
                
                fractional::initialize_fractional_ownership(
                    creator,
                    domain_obj,
                    total_supply,
                    ticker
                );
            };
            
            vector::push_back(&mut created_domains, domain_obj);
            i = i + 1;
        };
        
        created_domains
    }

    /// Create demo trading scenarios
    public fun create_demo_trading_scenarios(
        domains: &vector<Object<DomainAsset>>,
        seller: &signer
    ): vector<Object<marketplace::ShareListing>> {
        let listings = vector::empty<Object<marketplace::ShareListing>>();
        let len = vector::length(domains);
        let i = 0;
        
        while (i < len && i < 10) { // Create listings for first 10 domains
            let domain_obj = *vector::borrow(domains, i);
            
            // Check if domain has fractional ownership
            let fractional_config = domain_registry::get_fractional_config(domain_obj);
            if (option::is_some(&fractional_config)) {
                let config = option::borrow(&fractional_config);
                let total_supply = domain_registry::get_fractional_config_total_supply(config);
                
                // Create listing for 10% of shares
                let shares_to_sell = total_supply / 10;
                let valuation = domain_registry::get_domain_valuation(domain_obj);
                let market_value = domain_registry::get_valuation_market_value(&valuation);
                
                // Price per share based on market value
                let price_per_share = market_value / total_supply;
                
                let listing = marketplace::create_listing(
                    seller,
                    domain_obj,
                    price_per_share,
                    shares_to_sell
                );
                
                vector::push_back(&mut listings, listing);
            };
            
            i = i + 1;
        };
        
        listings
    }

    // ================================
    // Demo Scenario Functions
    // ================================

    /// Scenario 1: High-value domain trading
    public fun demo_scenario_high_value_trading(
        buyer: &signer,
        domains: &vector<Object<DomainAsset>>,
        listings: &vector<Object<marketplace::ShareListing>>
    ) {
        // Buy shares in Google.com (first domain/listing)
        if (vector::length(listings) > 0) {
            let google_listing = *vector::borrow(listings, 0);
            
            // Buy 1000 shares
            marketplace::buy_shares(buyer, google_listing, 1000);
        };
    }

    /// Scenario 2: Portfolio diversification
    public fun demo_scenario_portfolio_diversification(
        buyer: &signer,
        listings: &vector<Object<marketplace::ShareListing>>
    ) {
        let len = vector::length(listings);
        let i = 0;
        
        // Buy small amounts from multiple domains
        while (i < len && i < 5) {
            let listing = *vector::borrow(listings, i);
            
            // Buy 100 shares from each
            marketplace::buy_shares(buyer, listing, 100);
            i = i + 1;
        };
    }

    /// Scenario 3: Market making
    public fun demo_scenario_market_making(
        market_maker: &signer,
        domains: &vector<Object<DomainAsset>>
    ) {
        let len = vector::length(domains);
        let i = 0;
        
        // Create multiple listings at different price points
        while (i < len && i < 3) {
            let domain_obj = *vector::borrow(domains, i);
            let fractional_config = domain_registry::get_fractional_config(domain_obj);
            
            if (option::is_some(&fractional_config)) {
                let config = option::borrow(&fractional_config);
                let total_supply = domain_registry::get_fractional_config_total_supply(config);
                let valuation = domain_registry::get_domain_valuation(domain_obj);
                let market_value = domain_registry::get_valuation_market_value(&valuation);
                let base_price = market_value / total_supply;
                
                // Create listings at different price levels
                marketplace::create_listing(market_maker, domain_obj, base_price * 95 / 100, 1000); // 5% below market
                marketplace::create_listing(market_maker, domain_obj, base_price, 2000); // At market
                marketplace::create_listing(market_maker, domain_obj, base_price * 105 / 100, 1000); // 5% above market
            };
            
            i = i + 1;
        };
    }

    // ================================
    // Demo Data Queries
    // ================================

    /// Get demo market overview
    public fun get_demo_market_overview(): (u64, u64, u64) {
        let total_domains = if (domain_registry::get_total_domains() > 0) {
            domain_registry::get_total_domains()
        } else {
            15 // Expected demo domains
        };
        
        let (total_volume, total_trades, _, _) = marketplace::get_marketplace_stats();
        
        (total_domains, total_volume, total_trades)
    }

    /// Get demo domain showcase
    public fun get_demo_domain_showcase(): vector<String> {
        let showcase = vector::empty<String>();
        
        // Featured domains for demo
        vector::push_back(&mut showcase, string::utf8(b"google.com - The world's most valuable search domain"));
        vector::push_back(&mut showcase, string::utf8(b"amazon.com - E-commerce giant's digital real estate"));
        vector::push_back(&mut showcase, string::utf8(b"blockchain.com - Premier crypto domain"));
        vector::push_back(&mut showcase, string::utf8(b"ai-startup.com - Emerging AI sector opportunity"));
        vector::push_back(&mut showcase, string::utf8(b"web3.com - Next generation internet domain"));
        
        showcase
    }

    /// Get demo trading opportunities
    public fun get_demo_trading_opportunities(): vector<String> {
        let opportunities = vector::empty<String>();
        
        vector::push_back(&mut opportunities, string::utf8(b"GOOGL shares available at 50,000 APT per share"));
        vector::push_back(&mut opportunities, string::utf8(b"CRYP tokens showing 15% weekly growth"));
        vector::push_back(&mut opportunities, string::utf8(b"WEB3 domain undervalued - analyst target: +25%"));
        vector::push_back(&mut opportunities, string::utf8(b"DEFI sector rotation - accumulation phase"));
        vector::push_back(&mut opportunities, string::utf8(b"AIST emerging tech play - high growth potential"));
        
        opportunities
    }

    // ================================
    // Demo Utility Functions
    // ================================

    /// Generate demo user addresses
    public fun get_demo_user_addresses(): vector<address> {
        let users = vector::empty<address>();
        
        vector::push_back(&mut users, DEMO_USER_1);
        vector::push_back(&mut users, DEMO_USER_2);
        vector::push_back(&mut users, DEMO_USER_3);
        
        users
    }

    /// Get demo admin address
    public fun get_demo_admin_address(): address {
        DEMO_ADMIN
    }

    /// Create demo presentation script
    public fun get_demo_presentation_script(): vector<String> {
        let script = vector::empty<String>();
        
        vector::push_back(&mut script, string::utf8(b"1. Welcome to Orbiter - Domain Tokenization Platform"));
        vector::push_back(&mut script, string::utf8(b"2. Showcase: Premium domains like google.com tokenized"));
        vector::push_back(&mut script, string::utf8(b"3. Fractional ownership: Own shares in valuable domains"));
        vector::push_back(&mut script, string::utf8(b"4. Live trading: Real-time marketplace for domain shares"));
        vector::push_back(&mut script, string::utf8(b"5. Valuation oracle: AI-powered domain appraisals"));
        vector::push_back(&mut script, string::utf8(b"6. Portfolio management: Diversify across domain assets"));
        vector::push_back(&mut script, string::utf8(b"7. Demo trade: Buy GOOGL shares live on stage"));
        vector::push_back(&mut script, string::utf8(b"8. Market analytics: Real-time price and volume data"));
        vector::push_back(&mut script, string::utf8(b"9. Future roadmap: Cross-chain expansion and DeFi integration"));
        vector::push_back(&mut script, string::utf8(b"10. Q&A: Technical deep dive and investor questions"));
        
        script
    }

    /// Get demo statistics for presentation
    public fun get_demo_statistics(): (String, String, String, String) {
        let total_value = string::utf8(b"$2.5B+ Total Domain Value Tokenized");
        let active_traders = string::utf8(b"10,000+ Active Traders");
        let daily_volume = string::utf8(b"$50M+ Daily Trading Volume");
        let domains_listed = string::utf8(b"500+ Premium Domains Listed");
        
        (total_value, active_traders, daily_volume, domains_listed)
    }
}