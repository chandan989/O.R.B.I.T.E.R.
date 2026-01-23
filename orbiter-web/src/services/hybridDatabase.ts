// Hybrid Database Service - localStorage + Supabase
// import { createClient } from '@supabase/supabase-js' // Optional for production
import { domainStorage, DomainRecord } from './domainStorage'

// Supabase configuration (optional for hackathon)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: any = null

// Initialize Supabase if credentials are available (disabled for hackathon demo)
if (supabaseUrl && supabaseKey) {
  try {
    // supabase = createClient(supabaseUrl, supabaseKey) // Disabled for hackathon
    console.log('🔧 Supabase available but using localStorage for demo')
  } catch (error) {
    console.warn('⚠️ Supabase initialization failed, using localStorage fallback')
  }
} else {
  console.log('📱 Using localStorage database (perfect for hackathon demo)')
}

export class HybridDatabaseService {
  
  // Save domain to both localStorage AND Supabase (if available)
  async saveDomain(domainData: {
    domain: string;
    owner: string;
    txHash: string;
    valuation: any;
  }): Promise<DomainRecord> {
    
    console.log('💾 Saving domain to hybrid database...')
    
    // 1. Always save to localStorage (guaranteed to work)
    const savedDomain = await domainStorage.saveDomain(domainData)
    console.log('✅ Saved to localStorage:', savedDomain.id)
    
    // 2. Try to save to Supabase if available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('domains')
          .insert({
            domain_name: domainData.domain,
            owner_address: domainData.owner,
            transaction_hash: domainData.txHash,
            valuation_data: domainData.valuation,
            status: 'active'
          })
          .select()
        
        if (error) throw error
        console.log('🚀 Saved to Supabase:', data[0]?.id)
      } catch (error) {
        console.warn('⚠️ Supabase save failed, localStorage backup successful:', error)
      }
    }
    
    return savedDomain
  }
  
  // Get all domains from localStorage + Supabase (merged)
  async getAllDomains(): Promise<DomainRecord[]> {
    console.log('📡 Loading domains from hybrid database...')
    
    // Always get localStorage domains (guaranteed)
    const localDomains = domainStorage.getAllDomains()
    console.log(`📱 Local domains: ${localDomains.length}`)
    
    // Try to get Supabase domains if available
    if (supabase) {
      try {
        const { data: supabaseDomains, error } = await supabase
          .from('domains')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        // Convert Supabase format to DomainRecord format
        const convertedDomains: DomainRecord[] = supabaseDomains.map((d: any) => ({
          id: `SUP-${d.id.slice(0, 8)}`,
          domain: d.domain_name,
          owner: d.owner_address,
          txHash: d.transaction_hash,
          mintDate: d.created_at,
          blockHeight: Math.floor(Math.random() * 1000000) + 157000000,
          status: d.status || 'active',
          valuation: {
            score: parseInt(d.valuation_data.score) || 0,
            marketValue: parseInt(d.valuation_data.market_value) / 100000000 || 0,
            seoAuthority: parseInt(d.valuation_data.seo_authority) || 0,
            trafficEstimate: parseInt(d.valuation_data.traffic_estimate) || 0,
            brandability: parseInt(d.valuation_data.brandability) || 0,
            tldRarity: parseInt(d.valuation_data.tld_rarity) || 0,
          },
          metadata: {
            description: `Tokenized domain asset on Stacks blockchain`,
            attributes: [
              { trait_type: 'TLD', value: d.domain_name.split('.').pop() },
              { trait_type: 'Length', value: d.domain_name.replace(/\.\w+$/, '').length.toString() },
              { trait_type: 'Category', value: 'Real Transaction' }
            ]
          },
          tokenization: {
            tokenTicker: d.domain_name.replace(/\.\w+$/, '').toUpperCase().slice(0, 4),
            totalSupply: Math.round((parseInt(d.valuation_data.market_value) / 100000000) * 1000)
          },
          marketData: {
            floorPrice: (parseInt(d.valuation_data.market_value) / 100000000) * 0.8,
            dailyVolume: Math.round(Math.random() * 10000),
            totalVolume: Math.round(Math.random() * 100000),
            offers: Math.floor(Math.random() * 15),
            priceHistory: Array.from({length: 7}, () => Math.round(Math.random() * 100))
          }
        }))
        
        console.log(`🚀 Supabase domains: ${convertedDomains.length}`)
        
        // Merge and deduplicate (Supabase first, then localStorage for any missing)
        const mergedDomains = [...convertedDomains, ...localDomains.filter(local => 
          !convertedDomains.some(remote => remote.txHash === local.txHash)
        )]
        
        console.log(`✅ Total merged domains: ${mergedDomains.length}`)
        return mergedDomains
        
      } catch (error) {
        console.warn('⚠️ Supabase fetch failed, using localStorage only:', error)
      }
    }
    
    // Fallback to localStorage only
    return localDomains
  }
  
  // Setup real-time subscriptions (if Supabase available)
  setupRealTimeSync(callback: (domain: DomainRecord) => void) {
    if (!supabase) return null
    
    try {
      const subscription = supabase
        .channel('domains')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'domains' },
          (payload: any) => {
            console.log('🔄 Real-time domain added:', payload.new)
            // Convert and trigger callback
            callback({
              id: `SUP-${payload.new.id.slice(0, 8)}`,
              domain: payload.new.domain_name,
              owner: payload.new.owner_address,
              txHash: payload.new.transaction_hash,
              mintDate: payload.new.created_at,
              blockHeight: Math.floor(Math.random() * 1000000) + 157000000,
              status: payload.new.status || 'active',
              // ... rest of conversion
            } as DomainRecord)
          }
        )
        .subscribe()
      
      console.log('🔄 Real-time sync enabled')
      return subscription
    } catch (error) {
      console.warn('⚠️ Real-time setup failed:', error)
      return null
    }
  }
}

export const hybridDatabase = new HybridDatabaseService()