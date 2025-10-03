// Event parsing and handling utilities for ORBITER smart contracts

import { AptosClient } from 'aptos';
import {
  DomainTokenizedEvent,
  OwnershipTransferredEvent,
  ListingCreatedEvent,
  TradeExecutedEvent,
  ShareTransferEvent,
  ContractConfig
} from './types';

export class EventHandler {
  private client: AptosClient;
  private config: ContractConfig;

  constructor(config: ContractConfig) {
    this.config = config;
    this.client = new AptosClient(config.node_url);
  }

  // Event type mappings
  private getEventType(module: string, eventName: string): string {
    return `${this.config.package_address}::${module}::${eventName}`;
  }

  // Parse domain tokenized events
  async getDomainTokenizedEvents(
    startVersion?: number,
    limit: number = 100
  ): Promise<DomainTokenizedEvent[]> {
    try {
      const events = await this.client.getEventsByEventType(
        this.getEventType('domain_registry', 'DomainTokenizedEvent'),
        { start: startVersion, limit }
      );

      return events.map(event => this.parseDomainTokenizedEvent(event));
    } catch (error) {
      console.error('Error fetching domain tokenized events:', error);
      return [];
    }
  }

  // Parse ownership transfer events
  async getOwnershipTransferEvents(
    domainObject?: string,
    startVersion?: number,
    limit: number = 100
  ): Promise<OwnershipTransferredEvent[]> {
    try {
      const events = await this.client.getEventsByEventType(
        this.getEventType('domain_registry', 'OwnershipTransferredEvent'),
        { start: startVersion, limit }
      );

      let filteredEvents = events.map(event => this.parseOwnershipTransferEvent(event));
      
      if (domainObject) {
        filteredEvents = filteredEvents.filter(event => 
          event.domain_object === domainObject
        );
      }

      return filteredEvents;
    } catch (error) {
      console.error('Error fetching ownership transfer events:', error);
      return [];
    }
  }

  // Parse listing created events
  async getListingCreatedEvents(
    domainObject?: string,
    startVersion?: number,
    limit: number = 100
  ): Promise<ListingCreatedEvent[]> {
    try {
      const events = await this.client.getEventsByEventType(
        this.getEventType('marketplace', 'ListingCreatedEvent'),
        { start: startVersion, limit }
      );

      let filteredEvents = events.map(event => this.parseListingCreatedEvent(event));
      
      if (domainObject) {
        filteredEvents = filteredEvents.filter(event => 
          event.domain_object === domainObject
        );
      }

      return filteredEvents;
    } catch (error) {
      console.error('Error fetching listing created events:', error);
      return [];
    }
  }

  // Parse trade executed events
  async getTradeExecutedEvents(
    domainObject?: string,
    userAddress?: string,
    startVersion?: number,
    limit: number = 100
  ): Promise<TradeExecutedEvent[]> {
    try {
      const events = await this.client.getEventsByEventType(
        this.getEventType('marketplace', 'TradeExecutedEvent'),
        { start: startVersion, limit }
      );

      let filteredEvents = events.map(event => this.parseTradeExecutedEvent(event));
      
      if (domainObject) {
        filteredEvents = filteredEvents.filter(event => 
          event.domain_object === domainObject
        );
      }

      if (userAddress) {
        filteredEvents = filteredEvents.filter(event => 
          event.buyer === userAddress || event.seller === userAddress
        );
      }

      return filteredEvents;
    } catch (error) {
      console.error('Error fetching trade executed events:', error);
      return [];
    }
  }

  // Parse share transfer events
  async getShareTransferEvents(
    domainObject: string,
    userAddress?: string,
    startVersion?: number,
    limit: number = 100
  ): Promise<ShareTransferEvent[]> {
    try {
      const events = await this.client.getEventsByEventType(
        this.getEventType('fractional', 'ShareTransferEvent'),
        { start: startVersion, limit }
      );

      let filteredEvents = events.map(event => this.parseShareTransferEvent(event));
      
      if (userAddress) {
        filteredEvents = filteredEvents.filter(event => 
          event.from === userAddress || event.to === userAddress
        );
      }

      return filteredEvents;
    } catch (error) {
      console.error('Error fetching share transfer events:', error);
      return [];
    }
  }

  // Get all events for a specific domain
  async getDomainEvents(
    domainObject: string,
    startVersion?: number,
    limit: number = 50
  ) {
    const [
      tokenizedEvents,
      ownershipEvents,
      listingEvents,
      tradeEvents,
      shareEvents
    ] = await Promise.all([
      this.getDomainTokenizedEvents(startVersion, limit),
      this.getOwnershipTransferEvents(domainObject, startVersion, limit),
      this.getListingCreatedEvents(domainObject, startVersion, limit),
      this.getTradeExecutedEvents(domainObject, undefined, startVersion, limit),
      this.getShareTransferEvents(domainObject, undefined, startVersion, limit)
    ]);

    return {
      tokenized: tokenizedEvents.filter(e => e.domain_object === domainObject),
      ownership_transfers: ownershipEvents,
      listings: listingEvents,
      trades: tradeEvents,
      share_transfers: shareEvents
    };
  }

  // Get all events for a specific user
  async getUserEvents(
    userAddress: string,
    startVersion?: number,
    limit: number = 50
  ) {
    const [
      ownershipEvents,
      tradeEvents,
      shareEvents
    ] = await Promise.all([
      this.getOwnershipTransferEvents(undefined, startVersion, limit),
      this.getTradeExecutedEvents(undefined, userAddress, startVersion, limit),
      this.getShareTransferEvents('', userAddress, startVersion, limit)
    ]);

    return {
      ownership_transfers: ownershipEvents.filter(e => 
        e.from === userAddress || e.to === userAddress
      ),
      trades: tradeEvents,
      share_transfers: shareEvents
    };
  }

  // Event parsing methods
  private parseDomainTokenizedEvent(event: any): DomainTokenizedEvent {
    const data = event.data;
    return {
      domain_object: data.domain_object || '',
      domain_name: data.domain_name || '',
      owner: data.owner || '',
      valuation: data.valuation || {
        score: 0,
        market_value: 0,
        seo_authority: 0,
        traffic_estimate: 0,
        brandability: 0,
        tld_rarity: 0,
        updated_at: 0
      },
      fractional_config: data.fractional_config,
      timestamp: parseInt(data.timestamp || event.version || '0')
    };
  }

  private parseOwnershipTransferEvent(event: any): OwnershipTransferredEvent {
    const data = event.data;
    return {
      domain_object: data.domain_object || '',
      from: data.from || '',
      to: data.to || '',
      timestamp: parseInt(data.timestamp || event.version || '0')
    };
  }

  private parseListingCreatedEvent(event: any): ListingCreatedEvent {
    const data = event.data;
    return {
      listing_object: data.listing_object || '',
      domain_object: data.domain_object || '',
      seller: data.seller || '',
      price_per_share: parseInt(data.price_per_share || '0'),
      shares_available: parseInt(data.shares_available || '0'),
      timestamp: parseInt(data.timestamp || event.version || '0')
    };
  }

  private parseTradeExecutedEvent(event: any): TradeExecutedEvent {
    const data = event.data;
    return {
      listing_object: data.listing_object || '',
      domain_object: data.domain_object || '',
      buyer: data.buyer || '',
      seller: data.seller || '',
      shares_traded: parseInt(data.shares_traded || '0'),
      price_per_share: parseInt(data.price_per_share || '0'),
      total_amount: parseInt(data.total_amount || '0'),
      fee_amount: parseInt(data.fee_amount || '0'),
      timestamp: parseInt(data.timestamp || event.version || '0')
    };
  }

  private parseShareTransferEvent(event: any): ShareTransferEvent {
    const data = event.data;
    return {
      from: data.from || '',
      to: data.to || '',
      amount: parseInt(data.amount || '0'),
      timestamp: parseInt(data.timestamp || event.version || '0')
    };
  }

  // Real-time event subscription (WebSocket-based)
  subscribeToEvents(
    eventTypes: string[],
    callback: (event: any) => void,
    filter?: (event: any) => boolean
  ): () => void {
    // This would implement WebSocket subscription to Aptos events
    // For now, we'll use polling as a fallback
    let isSubscribed = true;
    let lastVersion = 0;

    const poll = async () => {
      if (!isSubscribed) return;

      try {
        for (const eventType of eventTypes) {
          const events = await this.client.getEventsByEventType(
            eventType,
            { start: lastVersion, limit: 10 }
          );

          for (const event of events) {
            if (!filter || filter(event)) {
              callback(event);
            }
            lastVersion = Math.max(lastVersion, parseInt(event.version));
          }
        }
      } catch (error) {
        console.error('Error polling events:', error);
      }

      setTimeout(poll, 5000); // Poll every 5 seconds
    };

    poll();

    return () => {
      isSubscribed = false;
    };
  }

  // Event filtering utilities
  static filterEventsByTimeRange(
    events: any[],
    startTime: number,
    endTime: number
  ): any[] {
    return events.filter(event => {
      const timestamp = event.timestamp || parseInt(event.version || '0');
      return timestamp >= startTime && timestamp <= endTime;
    });
  }

  static filterEventsByAddress(
    events: any[],
    address: string,
    addressFields: string[] = ['from', 'to', 'buyer', 'seller', 'owner']
  ): any[] {
    return events.filter(event => {
      return addressFields.some(field => event[field] === address);
    });
  }

  static sortEventsByTimestamp(events: any[], ascending: boolean = false): any[] {
    return events.sort((a, b) => {
      const timestampA = a.timestamp || parseInt(a.version || '0');
      const timestampB = b.timestamp || parseInt(b.version || '0');
      return ascending ? timestampA - timestampB : timestampB - timestampA;
    });
  }
}