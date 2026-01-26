;; O.R.B.I.T.E.R. Valuation Contract
;; AI-powered domain valuation and oracle system

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u400))
(define-constant err-not-found (err u401))
(define-constant err-unauthorized (err u402))
(define-constant err-invalid-score (err u403))
(define-constant err-not-oracle (err u404))
(define-constant err-already-voted (err u405))

;; Minimum consensus required (e.g., 3 out of 5 oracles)
(define-constant min-consensus u3)

;; Data Variables
(define-data-var oracle-count uint u0)

;; Data Maps
(define-map authorized-oracles
  { oracle: principal }
  { authorized: bool, added-at: uint }
)

(define-map domain-valuations
  { domain-id: uint }
  {
    score: uint,
    market-value: uint,
    seo-authority: uint,
    traffic-estimate: uint,
    brandability: uint,
    tld-rarity: uint,
    updated-at: uint,
    update-count: uint
  }
)

(define-map pending-valuations
  { domain-id: uint, proposal-id: uint }
  {
    score: uint,
    market-value: uint,
    seo-authority: uint,
    traffic-estimate: uint,
    brandability: uint,
    tld-rarity: uint,
    proposer: principal,
    votes: uint,
    executed: bool,
    created-at: uint
  }
)

(define-map valuation-votes
  { domain-id: uint, proposal-id: uint, oracle: principal }
  { voted: bool }
)

(define-data-var next-proposal-id uint u0)

;; Read-only functions
(define-read-only (get-valuation (domain-id uint))
  (map-get? domain-valuations { domain-id: domain-id })
)

(define-read-only (is-authorized-oracle (oracle principal))
  (default-to false
    (get authorized (map-get? authorized-oracles { oracle: oracle }))
  )
)

(define-read-only (get-oracle-count)
  (ok (var-get oracle-count))
)

(define-read-only (calculate-composite-score
    (market-value uint)
    (seo-authority uint)
    (traffic-estimate uint)
    (brandability uint)
    (tld-rarity uint)
  )
  (let
    (
      ;; Weighted average: 30% market, 25% SEO, 20% traffic, 15% brand, 10% TLD
      (weighted-sum (+
        (* market-value u30)
        (* seo-authority u25)
        (* traffic-estimate u20)
        (* brandability u15)
        (* tld-rarity u10)
      ))
    )
    (ok (/ weighted-sum u100))
  )
)

;; Public functions
(define-public (set-initial-valuation
    (domain-id uint)
    (score uint)
    (market-value uint)
    (seo-authority uint)
    (traffic-estimate uint)
    (brandability uint)
    (tld-rarity uint)
  )
  (begin
    ;; Note: Caller should be domain owner or authorized oracle
    ;; Ownership verification should be done off-chain
    
    ;; Validate scores (0-100)
    (asserts! (<= score u100) err-invalid-score)
    (asserts! (<= seo-authority u100) err-invalid-score)
    (asserts! (<= brandability u100) err-invalid-score)
    (asserts! (<= tld-rarity u100) err-invalid-score)
    
    ;; Set valuation
    (map-set domain-valuations
      { domain-id: domain-id }
      {
        score: score,
        market-value: market-value,
        seo-authority: seo-authority,
        traffic-estimate: traffic-estimate,
        brandability: brandability,
        tld-rarity: tld-rarity,
        updated-at: block-height,
        update-count: u1
      }
    )
    
    ;; Print event
    (print {
      event: "valuation-set",
      domain-id: domain-id,
      score: score,
      market-value: market-value
    })
    
    (ok true)
  )
)

(define-public (propose-valuation-update
    (domain-id uint)
    (score uint)
    (market-value uint)
    (seo-authority uint)
    (traffic-estimate uint)
    (brandability uint)
    (tld-rarity uint)
  )
  (let
    (
      (proposal-id (var-get next-proposal-id))
    )
    ;; Only authorized oracles can propose
    (asserts! (is-authorized-oracle tx-sender) err-not-oracle)
    
    ;; Validate scores
    (asserts! (<= score u100) err-invalid-score)
    (asserts! (<= seo-authority u100) err-invalid-score)
    (asserts! (<= brandability u100) err-invalid-score)
    (asserts! (<= tld-rarity u100) err-invalid-score)
    
    ;; Create proposal
    (map-set pending-valuations
      { domain-id: domain-id, proposal-id: proposal-id }
      {
        score: score,
        market-value: market-value,
        seo-authority: seo-authority,
        traffic-estimate: traffic-estimate,
        brandability: brandability,
        tld-rarity: tld-rarity,
        proposer: tx-sender,
        votes: u1,
        executed: false,
        created-at: block-height
      }
    )
    
    ;; Record proposer's vote
    (map-set valuation-votes
      { domain-id: domain-id, proposal-id: proposal-id, oracle: tx-sender }
      { voted: true }
    )
    
    ;; Update counter
    (var-set next-proposal-id (+ proposal-id u1))
    
    ;; Print event
    (print {
      event: "valuation-proposed",
      domain-id: domain-id,
      proposal-id: proposal-id,
      proposer: tx-sender,
      market-value: market-value
    })
    
    (ok proposal-id)
  )
)

(define-public (vote-on-valuation
    (domain-id uint)
    (proposal-id uint)
  )
  (let
    (
      (proposal (unwrap! (map-get? pending-valuations 
        { domain-id: domain-id, proposal-id: proposal-id }) err-not-found))
      (current-votes (get votes proposal))
    )
    ;; Only authorized oracles can vote
    (asserts! (is-authorized-oracle tx-sender) err-not-oracle)
    
    ;; Check if already voted
    (asserts! (is-none (map-get? valuation-votes 
      { domain-id: domain-id, proposal-id: proposal-id, oracle: tx-sender })) err-already-voted)
    
    ;; Check if not already executed
    (asserts! (not (get executed proposal)) err-unauthorized)
    
    ;; Record vote
    (map-set valuation-votes
      { domain-id: domain-id, proposal-id: proposal-id, oracle: tx-sender }
      { voted: true }
    )
    
    ;; Update vote count
    (let ((new-votes (+ current-votes u1)))
      (map-set pending-valuations
        { domain-id: domain-id, proposal-id: proposal-id }
        (merge proposal { votes: new-votes })
      )
      
      ;; Execute if consensus reached
      (if (>= new-votes min-consensus)
        (begin
          (try! (execute-valuation-update domain-id proposal-id))
          (ok true)
        )
        (ok true)
      )
    )
  )
)

(define-private (execute-valuation-update
    (domain-id uint)
    (proposal-id uint)
  )
  (let
    (
      (proposal (unwrap! (map-get? pending-valuations 
        { domain-id: domain-id, proposal-id: proposal-id }) err-not-found))
      (current-valuation (map-get? domain-valuations { domain-id: domain-id }))
    )
    ;; Mark as executed
    (map-set pending-valuations
      { domain-id: domain-id, proposal-id: proposal-id }
      (merge proposal { executed: true })
    )
    
    ;; Update valuation
    (map-set domain-valuations
      { domain-id: domain-id }
      {
        score: (get score proposal),
        market-value: (get market-value proposal),
        seo-authority: (get seo-authority proposal),
        traffic-estimate: (get traffic-estimate proposal),
        brandability: (get brandability proposal),
        tld-rarity: (get tld-rarity proposal),
        updated-at: block-height,
        update-count: (+ (default-to u0 (get update-count current-valuation)) u1)
      }
    )
    
    ;; Note: Domain registry must be updated separately
    ;; by calling domain-registry::update-valuation
    ;; This avoids circular dependencies
    
    ;; Print event
    (print {
      event: "valuation-updated",
      domain-id: domain-id,
      proposal-id: proposal-id,
      market-value: (get market-value proposal)
    })
    
    (ok true)
  )
)

;; Admin functions
(define-public (add-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    
    (map-set authorized-oracles
      { oracle: oracle }
      { authorized: true, added-at: block-height }
    )
    
    (var-set oracle-count (+ (var-get oracle-count) u1))
    
    (print {
      event: "oracle-added",
      oracle: oracle
    })
    
    (ok true)
  )
)

(define-public (remove-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    
    (map-set authorized-oracles
      { oracle: oracle }
      { authorized: false, added-at: block-height }
    )
    
    (var-set oracle-count (- (var-get oracle-count) u1))
    
    (print {
      event: "oracle-removed",
      oracle: oracle
    })
    
    (ok true)
  )
)
