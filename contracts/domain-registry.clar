;; O.R.B.I.T.E.R. Domain Registry Contract
;; Core domain tokenization logic for Stacks blockchain

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-paused (err u104))
(define-constant err-invalid-input (err u105))

;; Data Variables
(define-data-var registry-paused bool false)
(define-data-var total-domains uint u0)
(define-data-var next-domain-id uint u0)

;; Data Maps
(define-map domains
  { domain-id: uint }
  {
    domain-name: (string-ascii 256),
    owner: principal,
    verification-hash: (string-ascii 64),
    created-at: uint,
    valuation-score: uint,
    market-value: uint,
    seo-authority: uint,
    traffic-estimate: uint,
    brandability: uint,
    tld-rarity: uint,
    has-fractional: bool
  }
)

(define-map domain-name-to-id
  { domain-name: (string-ascii 256) }
  { domain-id: uint }
)

(define-map domain-owners
  { owner: principal, domain-id: uint }
  { active: bool }
)

;; Read-only functions
(define-read-only (get-domain-info (domain-id uint))
  (map-get? domains { domain-id: domain-id })
)

(define-read-only (get-domain-by-name (domain-name (string-ascii 256)))
  (match (map-get? domain-name-to-id { domain-name: domain-name })
    entry (get-domain-info (get domain-id entry))
    none
  )
)

(define-read-only (domain-exists (domain-name (string-ascii 256)))
  (is-some (map-get? domain-name-to-id { domain-name: domain-name }))
)

(define-read-only (is-domain-owner (domain-id uint) (address principal))
  (match (map-get? domains { domain-id: domain-id })
    domain (is-eq (get owner domain) address)
    false
  )
)

(define-read-only (get-registry-stats)
  {
    total-domains: (var-get total-domains),
    paused: (var-get registry-paused),
    admin: contract-owner
  }
)

(define-read-only (get-total-domains)
  (ok (var-get total-domains))
)

(define-read-only (is-paused)
  (ok (var-get registry-paused))
)

;; Private functions
(define-private (check-paused)
  (if (var-get registry-paused)
    err-paused
    (ok true)
  )
)

;; Public functions
(define-public (create-domain-object-entry
    (domain-name (string-ascii 256))
    (verification-hash (string-ascii 64))
    (valuation-score uint)
    (market-value uint)
    (seo-authority uint)
    (traffic-estimate uint)
    (brandability uint)
    (tld-rarity uint)
    (has-fractional bool)
    (ticker (string-ascii 10))
    (total-supply uint)
    (circulating-supply uint)
    (trading-enabled bool)
  )
  (let
    (
      (domain-id (var-get next-domain-id))
      (caller tx-sender)
    )
    ;; Check if paused
    (try! (check-paused))
    
    ;; Check if domain already exists
    (asserts! (not (domain-exists domain-name)) err-already-exists)
    
    ;; Validate inputs
    (asserts! (> (len domain-name) u0) err-invalid-input)
    (asserts! (> (len verification-hash) u0) err-invalid-input)
    
    ;; Create domain entry
    (map-set domains
      { domain-id: domain-id }
      {
        domain-name: domain-name,
        owner: caller,
        verification-hash: verification-hash,
        created-at: block-height,
        valuation-score: valuation-score,
        market-value: market-value,
        seo-authority: seo-authority,
        traffic-estimate: traffic-estimate,
        brandability: brandability,
        tld-rarity: tld-rarity,
        has-fractional: has-fractional
      }
    )
    
    ;; Map domain name to ID
    (map-set domain-name-to-id
      { domain-name: domain-name }
      { domain-id: domain-id }
    )
    
    ;; Track ownership
    (map-set domain-owners
      { owner: caller, domain-id: domain-id }
      { active: true }
    )
    
    ;; Update counters
    (var-set next-domain-id (+ domain-id u1))
    (var-set total-domains (+ (var-get total-domains) u1))
    
    ;; Note: Fractional ownership must be initialized separately
    ;; by calling fractional::initialize-fractional-ownership
    ;; This avoids circular dependencies
    
    ;; Print event
    (print {
      event: "domain-created",
      domain-id: domain-id,
      domain-name: domain-name,
      owner: caller,
      market-value: market-value,
      has-fractional: has-fractional
    })
    
    (ok domain-id)
  )
)

(define-public (transfer-domain (domain-id uint) (new-owner principal))
  (let
    (
      (domain (unwrap! (map-get? domains { domain-id: domain-id }) err-not-found))
      (caller tx-sender)
    )
    ;; Check ownership
    (asserts! (is-eq (get owner domain) caller) err-unauthorized)
    
    ;; Check if paused
    (try! (check-paused))
    
    ;; Update domain owner
    (map-set domains
      { domain-id: domain-id }
      (merge domain { owner: new-owner })
    )
    
    ;; Update ownership tracking
    (map-set domain-owners
      { owner: caller, domain-id: domain-id }
      { active: false }
    )
    
    (map-set domain-owners
      { owner: new-owner, domain-id: domain-id }
      { active: true }
    )
    
    ;; Print event
    (print {
      event: "domain-transferred",
      domain-id: domain-id,
      from: caller,
      to: new-owner
    })
    
    (ok true)
  )
)

(define-public (update-valuation
    (domain-id uint)
    (valuation-score uint)
    (market-value uint)
    (seo-authority uint)
    (traffic-estimate uint)
    (brandability uint)
    (tld-rarity uint)
  )
  (let
    (
      (domain (unwrap! (map-get? domains { domain-id: domain-id }) err-not-found))
      (caller tx-sender)
    )
    ;; Only owner or contract owner can update
    (asserts! (or (is-eq (get owner domain) caller) (is-eq caller contract-owner)) err-unauthorized)
    
    ;; Update valuation
    (map-set domains
      { domain-id: domain-id }
      (merge domain {
        valuation-score: valuation-score,
        market-value: market-value,
        seo-authority: seo-authority,
        traffic-estimate: traffic-estimate,
        brandability: brandability,
        tld-rarity: tld-rarity
      })
    )
    
    ;; Print event
    (print {
      event: "valuation-updated",
      domain-id: domain-id,
      market-value: market-value
    })
    
    (ok true)
  )
)

;; Admin functions
(define-public (pause-registry)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set registry-paused true)
    (ok true)
  )
)

(define-public (unpause-registry)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set registry-paused false)
    (ok true)
  )
)
