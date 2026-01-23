// Debug utilities for testing the constellation
import { domainStorage } from './domainStorage';

export const debugUtils = {
  // Add some sample domains for testing
  addSampleDomains: async () => {
    const sampleDomains = [
      {
        domain: 'test-example.com',
        owner: '0x1234567890abcdef',
        txHash: '0xtest1234567890abcdef1234567890abcdef',
        valuation: {
          score: '85',
          market_value: '500000000', // 5 USDCx
          seo_authority: '75',
          traffic_estimate: '60',
          brandability: '90',
          tld_rarity: '80',
          updated_at: String(Date.now())
        }
      },
      {
        domain: 'crypto-future.io',
        owner: '0x5678901234abcdef',
        txHash: '0xtest5678901234abcdef5678901234abcdef',
        valuation: {
          score: '92',
          market_value: '1200000000', // 12 USDCx
          seo_authority: '88',
          traffic_estimate: '85',
          brandability: '95',
          tld_rarity: '75',
          updated_at: String(Date.now())
        }
      }
    ];

    console.log('🧪 Adding sample domains for testing...');
    
    for (const domain of sampleDomains) {
      await domainStorage.saveDomain(domain);
    }
    
    console.log('✅ Sample domains added successfully!');
    console.log('🔄 Triggering constellation reload...');
    
    // Manually trigger constellation reload
    window.dispatchEvent(new CustomEvent('domainAdded', { detail: sampleDomains[0] }));
    
    return sampleDomains;
  },

  // Test the complete flow
  testCompleteFlow: async () => {
    console.log('🧪 Testing complete localStorage flow...');
    
    // Step 1: Clear existing data
    console.log('1️⃣ Clearing existing data...');
    domainStorage.clearAllDomains();
    
    // Step 2: Add a test domain
    console.log('2️⃣ Adding test domain...');
    const testDomain = {
      domain: 'flow-test.com',
      owner: '0xflowtestaddress',
      txHash: '0xflowtesthash123456789',
      valuation: {
        score: '90',
        market_value: '750000000', // 7.5 USDCx
        seo_authority: '80',
        traffic_estimate: '70',
        brandability: '85',
        tld_rarity: '90',
        updated_at: String(Date.now())
      }
    };
    
    const saved = await domainStorage.saveDomain(testDomain);
    console.log('✅ Domain saved:', saved);
    
    // Step 3: Retrieve and verify
    console.log('3️⃣ Retrieving all domains...');
    const allDomains = domainStorage.getAllDomains();
    console.log('📦 Retrieved domains:', allDomains);
    
    // Step 4: Check if domain exists
    console.log('4️⃣ Checking domain exists...');
    const exists = domainStorage.domainExists('flow-test.com');
    console.log('🔍 Domain exists:', exists);
    
    // Step 5: Get portfolio stats
    console.log('5️⃣ Getting portfolio stats...');
    const stats = domainStorage.getPortfolioStats();
    console.log('📊 Portfolio stats:', stats);
    
    if (allDomains.length > 0 && exists && stats.totalDomains > 0) {
      console.log('🎉 Complete flow test PASSED! ✅');
      console.log('💡 Try navigating to constellation to see the domain appear');
      return { success: true, message: 'Complete flow working perfectly!' };
    } else {
      console.log('❌ Complete flow test FAILED!');
      return { success: false, message: 'Flow has issues' };
    }
  },

  // Clear all data
  clearAllData: () => {
    domainStorage.clearAllDomains();
    console.log('🗑️ All constellation data cleared');
  },

  // Get stats
  getStats: () => {
    const stats = domainStorage.getPortfolioStats();
    console.log('📊 Current constellation stats:', stats);
    return stats;
  },

  // List all domains
  listDomains: () => {
    const domains = domainStorage.getAllDomains();
    console.log('🛰️ Current domains in constellation:', domains);
    return domains;
  }
};

// Make available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).orbiterDebug = debugUtils;
}