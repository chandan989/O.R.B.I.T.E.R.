// Demo Mode Configuration
// Set to true to simulate transactions without actual blockchain calls
// Perfect for demos, videos, and testing the UI flow

export const DEMO_MODE = false; // Set to false when contracts are deployed

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
    DOMAIN_REGISTRY: 'ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7.domain-registry',
    FRACTIONAL: 'ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7.fractional',
    MARKETPLACE: 'ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7.marketplace',
    VALUATION: 'ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7.valuation',
    SECURITY: 'ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7.security',
    VALIDATION: 'ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7.validation'
};
