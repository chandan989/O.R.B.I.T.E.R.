// Copyright (c) O.R.B.I.T.E.R. Protocol
// SPDX-License-Identifier: Apache-2.0

module orbiter_addr::orbiter {
    use std::string::{Self, String};
    use std::vector;

    use aptos_framework::object::{Self, Object, ConstructorRef, ExtendRef};
    use aptos_framework::event;
    use aptos_framework::account;

    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::property_map::{Self, PropertyMap};

    /// The name of the collection for all O.R.B.I.T.E.R. domain NFTs.
    const COLLECTION_NAME: vector<u8> = b"O.R.B.I.T.E.R. Satellite Constellation";
    /// The description for the O.R.B.I.T.E.R. collection.
    const COLLECTION_DESCRIPTION: vector<u8> = b"A collection of Web2 domains that have achieved stable orbit on the Aptos blockchain.";
    /// A URL for the collection's metadata.
    const COLLECTION_URI: vector<u8> = b"https://orbiter.space/collection";
    /// A default URI for the minted domain NFTs.
    const TOKEN_URI: vector<u8> = b"https://orbiter.space/asset/";

    /// A capability object that allows the contract owner to mint new domain NFTs.
    struct MintCapability has key {
        mint_ref: object::MintRef,
    }

    /// An event that is emitted when a new domain NFT is minted.
    #[event]
    struct DomainMinted has drop, store {
        domain_name: String,
        minter_address: address,
        token_address: address,
    }

    /// Initializes the O.R.B.I.T.E.R. module. This function is called once when the contract is deployed.
    /// It creates the main collection for all domain NFTs.
    fun init_module(deployer: &signer) {
        let deployer_addr = account::get_address(deployer);

        // Create the collection for O.R.B.I.T.E.R. assets.
        let constructor_ref = &object::create_named_object(deployer, COLLECTION_NAME);
        let collection_signer = object::generate_signer(constructor_ref);

        collection::create(
            &collection_signer,
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_NAME),
            option::none(), // No royalty
            string::utf8(COLLECTION_URI),
        );

        // Store the minting capability under the deployer's account.
        let mint_ref = object::generate_mint_ref(constructor_ref);
        move_to(deployer, MintCapability { mint_ref });
    }

    /// Mints a new domain NFT and transfers it to the recipient.
    /// This is an entry function that can be called by the contract owner.
    public entry fun mint_domain_nft(
        owner: &signer,
        recipient: address,
        domain_name: String,
    ) {
        let owner_addr = account::get_address(owner);
        assert!(exists<MintCapability>(owner_addr), 1);

        let mint_ref = &borrow_global<MintCapability>(owner_addr).mint_ref;

        // Create a property map for the NFT.
        let mut props = property_map::new();
        property_map::add(&mut props, string::utf8(b"domain_name"), property_map::create_string(domain_name));

        // Create (mint) the new token.
        let token_signer = token::create_with_ref(
            mint_ref,
            string::utf8(COLLECTION_NAME),
            domain_name,
            string::utf8(b"A verified Web2 domain in orbit."),
            option::some(string::utf8(TOKEN_URI)),
            props,
        );

        // Transfer the token to the recipient.
        let token_object = object::address_to_object<token::Token>(&token_signer);
        object::transfer(owner, token_object, recipient);

        // Emit an event to notify listeners that a new domain has been minted.
        event::emit(DomainMinted {
            domain_name,
            minter_address: owner_addr,
            token_address: object::get_address(&token_signer),
        });
    }

    /// A view function to get the domain name from a token object.
    public view fun get_domain_name(token_address: address): String {
        let token_object = object::address_to_object<token::Token>(token_address);
        let props = &borrow_global<token::Token>(token_object).properties;
        let domain_prop = property_map::read_string(props, &string::utf8(b"domain_name"));
        *domain_prop
    }
}