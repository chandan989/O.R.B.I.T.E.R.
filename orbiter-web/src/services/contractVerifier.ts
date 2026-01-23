// Contract verification utilities
import { CONTRACT_CONFIG } from '../config/contracts';

export const contractVerifier = {
  // Test if contract exists and is accessible
  async verifyContract() {
    console.log('🔍 Verifying smart contract...');
    console.log('📍 Contract address:', CONTRACT_CONFIG.CONTRACT_ADDRESS);
    
    try {
      // Check if contract exists
      const response = await fetch(`${CONTRACT_CONFIG.NODE_URL}/accounts/${CONTRACT_CONFIG.CONTRACT_ADDRESS}`);
      const accountData = await response.json();
      
      console.log('✅ Contract account found:', accountData);
      
      // Check modules
      const modulesResponse = await fetch(`${CONTRACT_CONFIG.NODE_URL}/accounts/${CONTRACT_CONFIG.CONTRACT_ADDRESS}/modules`);
      const modules = await modulesResponse.json();
      
      console.log('📦 Available modules:', modules.map((m: any) => m.abi?.name));
      
      // Check if domain_registry module exists
      const domainRegistryExists = modules.some((m: any) => m.abi?.name === 'domain_registry');
      
      if (domainRegistryExists) {
        console.log('✅ domain_registry module found!');
        
        // Check for required functions
        const domainModule = modules.find((m: any) => m.abi?.name === 'domain_registry');
        const functions = domainModule?.abi?.exposed_functions || [];
        console.log('🔧 Available functions:', functions.map((f: any) => f.name));
        
        const hasCreateFunction = functions.some((f: any) => f.name.includes('create_domain'));
        
        if (hasCreateFunction) {
          console.log('✅ Contract is FULLY FUNCTIONAL!');
          return { status: 'working', message: 'Contract is ready for transactions' };
        } else {
          console.log('❌ create_domain function not found');
          return { status: 'missing_function', message: 'Contract missing create_domain function' };
        }
      } else {
        console.log('❌ domain_registry module not found');
        return { status: 'missing_module', message: 'Contract missing domain_registry module' };
      }
      
    } catch (error) {
      console.error('❌ Contract verification failed:', error);
      return { status: 'error', message: error.message };
    }
  },

  // Test network connectivity
  async testNetwork() {
    console.log('🌐 Testing Stacks network connectivity...');
    
    try {
      const response = await fetch(`${CONTRACT_CONFIG.NODE_URL}/`);
      const data = await response.json();
      
      console.log('✅ Network connected:', data);
      return { status: 'connected', data };
    } catch (error) {
      console.error('❌ Network test failed:', error);
      return { status: 'disconnected', error: error.message };
    }
  },

  // Run full diagnostic
  async runDiagnostics() {
    console.log('🚀 Running full contract diagnostics...');
    
    const networkTest = await this.testNetwork();
    const contractTest = await this.verifyContract();
    
    const results = {
      network: networkTest,
      contract: contractTest,
      timestamp: new Date().toISOString()
    };
    
    console.log('📋 Diagnostic Results:', results);
    
    if (networkTest.status === 'connected' && contractTest.status === 'working') {
      console.log('🎉 ALL SYSTEMS GO! Contract should work perfectly.');
    } else {
      console.log('⚠️ Issues detected. Check the results above.');
    }
    
    return results;
  }
};

// Make available globally for testing
if (typeof window !== 'undefined') {
  (window as any).contractVerifier = contractVerifier;
}