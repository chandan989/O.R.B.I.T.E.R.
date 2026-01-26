;; O.R.B.I.T.E.R. Marketplace Contract
;; Trading infrastructure for domain shares

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u300))
(define-constant err-not-found (err u301))
(define-constant err-insufficient-shares (err u302))
(define-constant err-insufficient-payment (err u303))
(define-constant err-unauthorized (err u304))
(define-constant err-listing-inactive (err u305))
(define-constant err-invalid-price (err u306))
(define-constant err-paused (err u307))

;; Fee in basis points (30 = 0.3%)
(define-constant trading-fee-bps u30)

;; Data Variables
(define-data-var marketplace-paused bool false)
(define-data-var next-listing-id uint u0)
(define-data-var total-volume uint u0)
(define-data-var total-trades uint u0)
(define-data-var fee-collector principal contract-owner)

;; Data Maps
(define-map listings
  { listing-id: uint }
  {
    domain-id: uint,
    seller: principal,
    price-per-share: uint,
    shares-available: uint,
    shares-sold: uint,
    created-at: uint,
    active: bool
  }
)

(define-map user-listings
  { seller: principal, listing-id: uint }
  { active: bool }
)

(define-map domain-listings
  { domain-id: uint, listing-id: uint }
  { active: bool }
)

(define-map trade-history
  { trade-id: uint }
  {
    listing-id: uint,
    domain-id: uint,
    buyer: principal,
    seller: principal,
    shares: uint,
    price-per-share: uint,
    total-amount: uint,
    fee-amount: uint,
    executed-at: uint
  }
)

(define-data-var next-trade-id uint u0)

;; Read-only functions
(define-read-only (get-listing (listing-id uint))
  (map-get? listings { listing-id: listing-id })
)

(define-read-only (is-listing-active (listing-id uint))
  (match (map-get? listings { listing-id: listing-id })
    listing (ok (get active listing))
    (err err-not-found)
  )
)

(define-read-only (get-marketplace-stats)
  {
    total-volume: (var-get total-volume),
    total-trades: (var-get total-trades),
    trading-fee-bps: trading-fee-bps,
    paused: (var-get marketplace-paused),
    fee-collector: (var-get fee-collector)
  }
)

(define-read-only (calculate-fee (amount uint))
  (/ (* amount trading-fee-bps) u10000)
)

;; Private functions
(define-private (check-paused)
  (if (var-get marketplace-paused)
    err-paused
    (ok true)
  )
)

;; Public functions
(define-public (create-listing-entry
    (domain-id uint)
    (price-per-share uint)
    (shares-to-sell uint)
  )
  (let
    (
      (listing-id (var-get next-listing-id))
      (seller tx-sender)
      (seller-balance (contract-call? .fractional get-share-balance domain-id seller))
    )
    ;; Check if paused
    (try! (check-paused))
    
    ;; Validate inputs
    (asserts! (> price-per-share u0) err-invalid-price)
    (asserts! (> shares-to-sell u0) err-invalid-price)
    
    ;; Check if seller has enough shares
    (asserts! (>= seller-balance shares-to-sell) err-insufficient-shares)
    
    ;; Check if trading is enabled
    (asserts! (unwrap! (contract-call? .fractional is-trading-enabled domain-id) err-not-found) err-paused)
    
    ;; Create listing
    (map-set listings
      { listing-id: listing-id }
      {
        domain-id: domain-id,
        seller: seller,
        price-per-share: price-per-share,
        shares-available: shares-to-sell,
        shares-sold: u0,
        created-at: block-height,
        active: true
      }
    )
    
    ;; Track user listing
    (map-set user-listings
      { seller: seller, listing-id: listing-id }
      { active: true }
    )
    
    ;; Track domain listing
    (map-set domain-listings
      { domain-id: domain-id, listing-id: listing-id }
      { active: true }
    )
    
    ;; Update counter
    (var-set next-listing-id (+ listing-id u1))
    
    ;; Print event
    (print {
      event: "listing-created",
      listing-id: listing-id,
      domain-id: domain-id,
      seller: seller,
      price-per-share: price-per-share,
      shares: shares-to-sell
    })
    
    (ok listing-id)
  )
)

(define-public (buy-shares-entry
    (listing-id uint)
    (shares-to-buy uint)
  )
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
      (buyer tx-sender)
      (seller (get seller listing))
      (domain-id (get domain-id listing))
      (price-per-share (get price-per-share listing))
      (shares-available (get shares-available listing))
      (shares-sold (get shares-sold listing))
      (total-cost (* price-per-share shares-to-buy))
      (fee (calculate-fee total-cost))
      (seller-receives (- total-cost fee))
      (trade-id (var-get next-trade-id))
    )
    ;; Check if paused
    (try! (check-paused))
    
    ;; Validate listing is active
    (asserts! (get active listing) err-listing-inactive)
    
    ;; Validate shares available
    (asserts! (> shares-to-buy u0) err-invalid-price)
    (asserts! (<= shares-to-buy shares-available) err-insufficient-shares)
    
    ;; Transfer shares from seller to buyer
    (try! (contract-call? .fractional transfer-from domain-id seller buyer shares-to-buy))
    
    ;; Note: In a real implementation, you would handle STX payment here
    ;; For now, we assume payment is handled off-chain or via another mechanism
    
    ;; Update listing
    (map-set listings
      { listing-id: listing-id }
      (merge listing {
        shares-available: (- shares-available shares-to-buy),
        shares-sold: (+ shares-sold shares-to-buy),
        active: (if (is-eq shares-available shares-to-buy) false true)
      })
    )
    
    ;; Record trade
    (map-set trade-history
      { trade-id: trade-id }
      {
        listing-id: listing-id,
        domain-id: domain-id,
        buyer: buyer,
        seller: seller,
        shares: shares-to-buy,
        price-per-share: price-per-share,
        total-amount: total-cost,
        fee-amount: fee,
        executed-at: block-height
      }
    )
    
    ;; Update stats
    (var-set next-trade-id (+ trade-id u1))
    (var-set total-volume (+ (var-get total-volume) total-cost))
    (var-set total-trades (+ (var-get total-trades) u1))
    
    ;; Print event
    (print {
      event: "trade-executed",
      trade-id: trade-id,
      listing-id: listing-id,
      domain-id: domain-id,
      buyer: buyer,
      seller: seller,
      shares: shares-to-buy,
      total-cost: total-cost,
      fee: fee
    })
    
    (ok trade-id)
  )
)

(define-public (cancel-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
      (seller (get seller listing))
    )
    ;; Only seller can cancel
    (asserts! (is-eq tx-sender seller) err-unauthorized)
    
    ;; Deactivate listing
    (map-set listings
      { listing-id: listing-id }
      (merge listing { active: false })
    )
    
    ;; Update tracking
    (map-set user-listings
      { seller: seller, listing-id: listing-id }
      { active: false }
    )
    
    (map-set domain-listings
      { domain-id: (get domain-id listing), listing-id: listing-id }
      { active: false }
    )
    
    ;; Print event
    (print {
      event: "listing-cancelled",
      listing-id: listing-id,
      seller: seller
    })
    
    (ok true)
  )
)

(define-public (update-listing-price
    (listing-id uint)
    (new-price-per-share uint)
  )
  (let
    (
      (listing (unwrap! (map-get? listings { listing-id: listing-id }) err-not-found))
      (seller (get seller listing))
    )
    ;; Only seller can update
    (asserts! (is-eq tx-sender seller) err-unauthorized)
    
    ;; Validate new price
    (asserts! (> new-price-per-share u0) err-invalid-price)
    
    ;; Update listing
    (map-set listings
      { listing-id: listing-id }
      (merge listing { price-per-share: new-price-per-share })
    )
    
    ;; Print event
    (print {
      event: "listing-price-updated",
      listing-id: listing-id,
      new-price: new-price-per-share
    })
    
    (ok true)
  )
)

;; Admin functions
(define-public (pause-marketplace)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set marketplace-paused true)
    (ok true)
  )
)

(define-public (unpause-marketplace)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set marketplace-paused false)
    (ok true)
  )
)

(define-public (set-fee-collector (new-collector principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set fee-collector new-collector)
    (ok true)
  )
)
