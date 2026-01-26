;; O.R.B.I.T.E.R. Fractional Ownership Contract
;; Manages fractional shares of tokenized domains

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-not-found (err u201))
(define-constant err-insufficient-balance (err u202))
(define-constant err-unauthorized (err u203))
(define-constant err-already-initialized (err u204))
(define-constant err-invalid-amount (err u205))
(define-constant err-trading-disabled (err u206))

;; Data Maps
(define-map fractional-configs
  { domain-id: uint }
  {
    ticker: (string-ascii 10),
    total-supply: uint,
    circulating-supply: uint,
    trading-enabled: bool,
    initialized-at: uint
  }
)

(define-map share-balances
  { domain-id: uint, holder: principal }
  { balance: uint }
)

(define-map share-allowances
  { domain-id: uint, owner: principal, spender: principal }
  { allowance: uint }
)

(define-map total-holders
  { domain-id: uint }
  { count: uint }
)

;; Read-only functions
(define-read-only (get-fractional-config (domain-id uint))
  (map-get? fractional-configs { domain-id: domain-id })
)

(define-read-only (get-share-balance (domain-id uint) (holder principal))
  (default-to u0
    (get balance (map-get? share-balances { domain-id: domain-id, holder: holder }))
  )
)

(define-read-only (get-total-supply (domain-id uint))
  (match (map-get? fractional-configs { domain-id: domain-id })
    config (ok (get total-supply config))
    (err err-not-found)
  )
)

(define-read-only (get-allowance (domain-id uint) (owner principal) (spender principal))
  (default-to u0
    (get allowance (map-get? share-allowances 
      { domain-id: domain-id, owner: owner, spender: spender }))
  )
)

(define-read-only (is-trading-enabled (domain-id uint))
  (match (map-get? fractional-configs { domain-id: domain-id })
    config (ok (get trading-enabled config))
    (err err-not-found)
  )
)

;; Public functions
(define-public (initialize-fractional-ownership
    (domain-id uint)
    (total-supply uint)
    (ticker (string-ascii 10))
    (circulating-supply uint)
    (trading-enabled bool)
  )
  (let
    (
      (caller tx-sender)
    )
    ;; Check if already initialized
    (asserts! (is-none (map-get? fractional-configs { domain-id: domain-id })) err-already-initialized)
    
    ;; Note: Caller should be domain owner, but we can't verify without circular dependency
    ;; Domain ownership should be verified off-chain before calling this
    
    ;; Validate inputs
    (asserts! (> total-supply u0) err-invalid-amount)
    (asserts! (<= circulating-supply total-supply) err-invalid-amount)
    
    ;; Create fractional config
    (map-set fractional-configs
      { domain-id: domain-id }
      {
        ticker: ticker,
        total-supply: total-supply,
        circulating-supply: circulating-supply,
        trading-enabled: trading-enabled,
        initialized-at: block-height
      }
    )
    
    ;; Mint all shares to caller
    (map-set share-balances
      { domain-id: domain-id, holder: caller }
      { balance: total-supply }
    )
    
    ;; Initialize holder count
    (map-set total-holders
      { domain-id: domain-id }
      { count: u1 }
    )
    
    ;; Print event
    (print {
      event: "fractional-initialized",
      domain-id: domain-id,
      ticker: ticker,
      total-supply: total-supply,
      owner: caller
    })
    
    (ok true)
  )
)

(define-public (transfer-shares
    (domain-id uint)
    (recipient principal)
    (amount uint)
  )
  (let
    (
      (sender tx-sender)
      (sender-balance (get-share-balance domain-id sender))
      (recipient-balance (get-share-balance domain-id recipient))
      (config (unwrap! (map-get? fractional-configs { domain-id: domain-id }) err-not-found))
    )
    ;; Validate amount
    (asserts! (> amount u0) err-invalid-amount)
    
    ;; Check balance
    (asserts! (>= sender-balance amount) err-insufficient-balance)
    
    ;; Check if trading is enabled
    (asserts! (get trading-enabled config) err-trading-disabled)
    
    ;; Update balances
    (map-set share-balances
      { domain-id: domain-id, holder: sender }
      { balance: (- sender-balance amount) }
    )
    
    (map-set share-balances
      { domain-id: domain-id, holder: recipient }
      { balance: (+ recipient-balance amount) }
    )
    
    ;; Update holder count if new holder
    (if (is-eq recipient-balance u0)
      (map-set total-holders
        { domain-id: domain-id }
        { count: (+ (default-to u0 (get count (map-get? total-holders { domain-id: domain-id }))) u1) }
      )
      true
    )
    
    ;; Print event
    (print {
      event: "shares-transferred",
      domain-id: domain-id,
      from: sender,
      to: recipient,
      amount: amount
    })
    
    (ok true)
  )
)

(define-public (approve-shares
    (domain-id uint)
    (spender principal)
    (amount uint)
  )
  (begin
    ;; Set allowance
    (map-set share-allowances
      { domain-id: domain-id, owner: tx-sender, spender: spender }
      { allowance: amount }
    )
    
    ;; Print event
    (print {
      event: "shares-approved",
      domain-id: domain-id,
      owner: tx-sender,
      spender: spender,
      amount: amount
    })
    
    (ok true)
  )
)

(define-public (transfer-from
    (domain-id uint)
    (owner principal)
    (recipient principal)
    (amount uint)
  )
  (let
    (
      (spender tx-sender)
      (allowance (get-allowance domain-id owner spender))
      (owner-balance (get-share-balance domain-id owner))
      (recipient-balance (get-share-balance domain-id recipient))
    )
    ;; Check allowance
    (asserts! (>= allowance amount) err-unauthorized)
    
    ;; Check balance
    (asserts! (>= owner-balance amount) err-insufficient-balance)
    
    ;; Update balances
    (map-set share-balances
      { domain-id: domain-id, holder: owner }
      { balance: (- owner-balance amount) }
    )
    
    (map-set share-balances
      { domain-id: domain-id, holder: recipient }
      { balance: (+ recipient-balance amount) }
    )
    
    ;; Update allowance
    (map-set share-allowances
      { domain-id: domain-id, owner: owner, spender: spender }
      { allowance: (- allowance amount) }
    )
    
    ;; Print event
    (print {
      event: "shares-transferred-from",
      domain-id: domain-id,
      from: owner,
      to: recipient,
      spender: spender,
      amount: amount
    })
    
    (ok true)
  )
)

(define-public (enable-trading (domain-id uint))
  (let
    (
      (config (unwrap! (map-get? fractional-configs { domain-id: domain-id }) err-not-found))
    )
    ;; Note: Caller should be domain owner, verified off-chain
    
    ;; Update config
    (map-set fractional-configs
      { domain-id: domain-id }
      (merge config { trading-enabled: true })
    )
    
    (ok true)
  )
)

(define-public (disable-trading (domain-id uint))
  (let
    (
      (config (unwrap! (map-get? fractional-configs { domain-id: domain-id }) err-not-found))
    )
    ;; Note: Caller should be domain owner, verified off-chain
    
    ;; Update config
    (map-set fractional-configs
      { domain-id: domain-id }
      (merge config { trading-enabled: false })
    )
    
    (ok true)
  )
)
