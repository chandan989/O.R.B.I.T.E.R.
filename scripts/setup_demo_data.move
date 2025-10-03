script {
    use orbiter::domain_registry;
    use orbiter::fractional;
    use orbiter::marketplace;

    use std::string;
    use std::option;
    use std::signer;

    /// Create demo domain data for hackathon presentation
    /// This script creates sample domains with fractional ownership enabled
    fun setup_demo_data(demo_account: &signer) {
        let _demo_address = signer::address_of(demo_account);
        
        // Create demo valuation data for google.com
        let google_valuation = domain_registry::new_valuation_data(
            950, // score
            1000000, // market_value (1M APT)
            900, // seo_authority
            950, // traffic_estimate
            980, // brandability
            800, // tld_rarity (.com is common)
            1703980800 // updated_at timestamp
        );
        
        // Create fractional config for google.com
        let google_fractional = domain_registry::new_fractional_config(
            string::utf8(b"GOOGL"),
            1000000, // total_supply
            true // trading_enabled
        );
        
        // Tokenize google.com
        let google_domain = domain_registry::create_domain_object(
            demo_account,
            string::utf8(b"google.com"),
            string::utf8(b"demo_verification_hash_google"),
            google_valuation,
            option::some(google_fractional)
        );
        
        // Initialize fractional ownership for google.com
        fractional::initialize_fractional_ownership(
            demo_account,
            google_domain,
            1000000,
            string::utf8(b"GOOGL")
        );
        
        // Create demo valuation data for apple.com
        let apple_valuation = domain_registry::new_valuation_data(
            920, // score
            800000, // market_value (800K APT)
            880, // seo_authority
            900, // traffic_estimate
            950, // brandability
            800, // tld_rarity
            1703980800 // updated_at timestamp
        );
        
        let apple_fractional = domain_registry::new_fractional_config(
            string::utf8(b"AAPL"),
            500000, // total_supply
            true // trading_enabled
        );
        
        // Tokenize apple.com
        let apple_domain = domain_registry::create_domain_object(
            demo_account,
            string::utf8(b"apple.com"),
            string::utf8(b"demo_verification_hash_apple"),
            apple_valuation,
            option::some(apple_fractional)
        );
        
        // Initialize fractional ownership for apple.com
        fractional::initialize_fractional_ownership(
            demo_account,
            apple_domain,
            500000,
            string::utf8(b"AAPL")
        );
        
        // Create a sample listing for google.com shares
        marketplace::create_listing(
            demo_account,
            google_domain,
            100, // price_per_share (100 APT per share)
            10000 // shares_to_sell (1% of total supply)
        );
        
        // Create a sample listing for apple.com shares
        marketplace::create_listing(
            demo_account,
            apple_domain,
            160, // price_per_share (160 APT per share)
            5000 // shares_to_sell (1% of total supply)
        );
    }
}