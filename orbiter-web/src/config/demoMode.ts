// Demo Mode Configuration
// Set to true to simulate transactions without actual blockchain calls
// Perfect for demos, videos, and testing the UI flow

export const DEMO_MODE = true; // Set to false when contracts are deployed

export const DEMO_CONFIG = {
    // Simulated transaction delay (ms)
    TX_DELAY: 2000,

    // Mock transaction IDs
    generateMockTxId: () => {
        return '0x' + Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    },

    // Mock contract responses
    MOCK_RESPONSES: {
        createDomain: {
            success: true,
            txId: null, // Will be generated
            domainId: 1,
            message: 'Domain created successfully (DEMO MODE)'
        }
    }
};

// When contracts are deployed, update this:
export const DEPLOYED_CONTRACTS = {
    // Replace with actual deployed contract addresses
    DOMAIN_REGISTRY: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.domain-registry',
    FRACTIONAL: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fractional',
    MARKETPLACE: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.marketplace',
    VALUATION: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.valuation',
    SECURITY: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.security',
    VALIDATION: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.validation'
};
