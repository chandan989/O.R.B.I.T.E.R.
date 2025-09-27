import { create } from 'zustand';

type Stage = 'pre-flight' | 'authorization' | 'insertion' | 'success';

interface LaunchState {
  stage: Stage;
  domain: string;
  txtRecord: {
    name: string;
    value: string;
  } | null;
  isVerified: boolean;
  txHash: string | null;
  error: string | null;
  isLoading: boolean;

  setDomain: (domain: string) => void;
  setStage: (stage: Stage) => void;
  setTxtRecord: (name: string, value: string) => void;
  setIsVerified: (verified: boolean) => void;
  setTxHash: (hash: string) => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useLaunchStore = create<LaunchState>((set) => ({
  stage: 'pre-flight',
  domain: '',
  txtRecord: null,
  isVerified: false,
  txHash: null,
  error: null,
  isLoading: false,

  setDomain: (domain) => set({ domain }),
  setStage: (stage) => set({ stage }),
  setTxtRecord: (name, value) => set({ txtRecord: { name, value } }),
  setIsVerified: (verified) => set({ isVerified: verified }),
  setTxHash: (hash) => set({ txHash: hash }),
  setError: (error) => set({ error }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  reset: () => set({
    stage: 'pre-flight',
    domain: '',
    txtRecord: null,
    isVerified: false,
    txHash: null,
    error: null,
    isLoading: false,
  }),
}));