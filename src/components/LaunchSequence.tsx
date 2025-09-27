"use client";

import { useLaunchStore } from "@/store/launch";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// TODO: Replace with your actual contract address
const CONTRACT_ADDRESS = "0x123";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export const LaunchSequence = () => {
    const { account, signAndSubmitTransaction } = useWallet();
    const {
        stage,
        domain,
        txtRecord,
        isVerified,
        txHash,
        error,
        isLoading,
        setDomain,
        setStage,
        setTxtRecord,
        setIsVerified,
        setTxHash,
        setError,
        setIsLoading,
        reset,
    } = useLaunchStore();

    const handleGenerateTxt = async () => {
        if (!domain || !account) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/generate-txt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, walletAddress: account.address }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to generate TXT record');
            setTxtRecord(data.txtRecordName, data.txtRecordValue);
            setStage('authorization');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyDns = async () => {
        if (!domain || !txtRecord) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/verify-dns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, recordName: txtRecord.name, expectedValue: txtRecord.value }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to verify DNS');
            if (data.verified) {
                setIsVerified(true);
            } else {
                setError(data.message || 'Verification failed.');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMint = async () => {
        if (!isVerified || !account || !domain) return;
        setIsLoading(true);
        setError(null);
        try {
            const payload = {
                type: "entry_function_payload",
                function: `${CONTRACT_ADDRESS}::orbiter::mint_domain_nft`,
                type_arguments: [],
                arguments: [account.address, domain],
            };
            const response = await signAndSubmitTransaction(payload as any);
            await aptos.waitForTransaction({ transactionHash: response.hash });
            setTxHash(response.hash);
            setStage('success');
        } catch (e: any) {
            setError(e.message || 'Minting failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {stage === 'pre-flight' && (
                <div>
                    <h3 className="font-space-grotesk text-xl font-bold solar-yellow-text">Stage 1: Pre-Flight Check</h3>
                    <p className="text-gray-400 mt-1 mb-4">Enter the domain you wish to bring into orbit.</p>
                    <input
                        type="text"
                        placeholder="yourdomain.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full bg-[#1c1c1c] border border-[#3D2D1D] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    />
                    <button onClick={handleGenerateTxt} disabled={isLoading || !domain} className="cta-button mt-4 w-full bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-6 py-2 rounded-lg disabled:opacity-50">
                        {isLoading ? "Generating..." : "Generate TXT Record"}
                    </button>
                </div>
            )}

            {stage === 'authorization' && !isVerified && (
                <div>
                    <h3 className="font-space-grotesk text-xl font-bold solar-yellow-text">Stage 2: Launch Authorization</h3>
                    <p className="text-gray-400 mt-1 mb-4">Add the following TXT record to your domain's DNS settings:</p>
                    <div className="glass-panel p-4 rounded-md font-ibm-plex-mono text-sm space-y-2">
                        <p><span className="font-bold text-gray-300">Name/Host:</span> {txtRecord?.name}</p>
                        <p><span className="font-bold text-gray-300">Value:</span> <span className="break-all">{txtRecord?.value}</span></p>
                    </div>
                    <button onClick={handleVerifyDns} disabled={isLoading} className="cta-button mt-4 w-full bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-6 py-2 rounded-lg disabled:opacity-50">
                        {isLoading ? "Verifying..." : "Verify DNS"}
                    </button>
                </div>
            )}

            {stage === 'authorization' && isVerified && (
                 <div>
                    <h3 className="font-space-grotesk text-xl font-bold solar-yellow-text">Stage 3: Orbital Insertion</h3>
                    <p className="text-gray-400 mt-1 mb-4">Domain ownership verified. You are cleared for launch.</p>
                    <button onClick={handleMint} disabled={isLoading} className="cta-button mt-4 w-full bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-6 py-2 rounded-lg disabled:opacity-50">
                        {isLoading ? "Launching..." : "[ IGNITION ]"}
                    </button>
                </div>
            )}

            {stage === 'success' && (
                <div>
                    <h3 className="font-space-grotesk text-xl font-bold text-green-400">Launch Successful!</h3>
                    <p className="text-gray-300 mt-2">{domain} has achieved stable orbit.</p>
                    <a href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`} target="_blank" rel="noopener noreferrer" className="text-[#FFC700] hover:underline break-all">
                        View Transaction
                    </a>
                    <button onClick={reset} className="mt-4 w-full text-sm text-gray-400 hover:text-white">Start a new launch</button>
                </div>
            )}

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
    );
};