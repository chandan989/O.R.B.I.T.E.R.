;; O.R.B.I.T.E.R. Validation Contract
;; Input validation and business logic constraints

;; Constants
(define-constant err-invalid-domain-name (err u600))
(define-constant err-invalid-hash (err u601))
(define-constant err-invalid-price (err u602))
(define-constant err-invalid-amount (err u603))
(define-constant err-invalid-score (err u604))
(define-constant err-invalid-ticker (err u605))
(define-constant err-invalid-supply (err u606))
(define-constant err-invalid-address (err u607))

;; Domain name validation constants
(define-constant min-domain-length u3)
(define-constant max-domain-length u256)
(define-constant min-hash-length u32)
(define-constant max-hash-length u64)

;; Ticker validation
(define-constant min-ticker-length u2)
(define-constant max-ticker-length u10)

;; Price and amount constraints
(define-constant min-price u1)
(define-constant max-price u1000000000000) ;; 1 trillion micro-STX
(define-constant min-shares u1)
(define-constant max-shares u1000000000000) ;; 1 trillion shares

;; Score constraints (0-100)
(define-constant min-score u0)
(define-constant max-score u100)

;; Read-only validation functions

(define-read-only (validate-domain-name (domain-name (string-ascii 256)))
  (let
    (
      (name-length (len domain-name))
    )
    (and
      (>= name-length min-domain-length)
      (<= name-length max-domain-length)
    )
  )
)

(define-read-only (validate-verification-hash (hash (string-ascii 64)))
  (let
    (
      (hash-length (len hash))
    )
    (and
      (>= hash-length min-hash-length)
      (<= hash-length max-hash-length)
    )
  )
)

(define-read-only (validate-ticker (ticker (string-ascii 10)))
  (let
    (
      (ticker-length (len ticker))
    )
    (and
      (>= ticker-length min-ticker-length)
      (<= ticker-length max-ticker-length)
    )
  )
)

(define-read-only (validate-price (price uint))
  (and
    (>= price min-price)
    (<= price max-price)
  )
)

(define-read-only (validate-shares (shares uint))
  (and
    (>= shares min-shares)
    (<= shares max-shares)
  )
)

(define-read-only (validate-score (score uint))
  (and
    (>= score min-score)
    (<= score max-score)
  )
)

(define-read-only (validate-supply (total-supply uint) (circulating-supply uint))
  (and
    (> total-supply u0)
    (<= circulating-supply total-supply)
    (<= total-supply max-shares)
  )
)

(define-read-only (validate-valuation-data
    (score uint)
    (market-value uint)
    (seo-authority uint)
    (traffic-estimate uint)
    (brandability uint)
    (tld-rarity uint)
  )
  (and
    (validate-score score)
    (> market-value u0)
    (validate-score seo-authority)
    (validate-score brandability)
    (validate-score tld-rarity)
  )
)

;; Public validation functions that return errors

(define-public (assert-valid-domain-name (domain-name (string-ascii 256)))
  (begin
    (asserts! (validate-domain-name domain-name) err-invalid-domain-name)
    (ok true)
  )
)

(define-public (assert-valid-hash (hash (string-ascii 64)))
  (begin
    (asserts! (validate-verification-hash hash) err-invalid-hash)
    (ok true)
  )
)

(define-public (assert-valid-ticker (ticker (string-ascii 10)))
  (begin
    (asserts! (validate-ticker ticker) err-invalid-ticker)
    (ok true)
  )
)

(define-public (assert-valid-price (price uint))
  (begin
    (asserts! (validate-price price) err-invalid-price)
    (ok true)
  )
)

(define-public (assert-valid-shares (shares uint))
  (begin
    (asserts! (validate-shares shares) err-invalid-amount)
    (ok true)
  )
)

(define-public (assert-valid-score (score uint))
  (begin
    (asserts! (validate-score score) err-invalid-score)
    (ok true)
  )
)

(define-public (assert-valid-supply (total-supply uint) (circulating-supply uint))
  (begin
    (asserts! (validate-supply total-supply circulating-supply) err-invalid-supply)
    (ok true)
  )
)

(define-public (assert-valid-valuation
    (score uint)
    (market-value uint)
    (seo-authority uint)
    (traffic-estimate uint)
    (brandability uint)
    (tld-rarity uint)
  )
  (begin
    (asserts! (validate-valuation-data 
      score market-value seo-authority traffic-estimate brandability tld-rarity
    ) err-invalid-score)
    (ok true)
  )
)

;; Comprehensive validation for domain creation
(define-public (validate-domain-creation
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
  )
  (begin
    ;; Validate domain name
    (try! (assert-valid-domain-name domain-name))
    
    ;; Validate hash
    (try! (assert-valid-hash verification-hash))
    
    ;; Validate valuation
    (try! (assert-valid-valuation 
      valuation-score market-value seo-authority 
      traffic-estimate brandability tld-rarity
    ))
    
    ;; Validate fractional config if enabled
    (if has-fractional
      (begin
        (try! (assert-valid-ticker ticker))
        (try! (assert-valid-supply total-supply circulating-supply))
        (ok true)
      )
      (ok true)
    )
  )
)

;; Comprehensive validation for listing creation
(define-public (validate-listing-creation
    (price-per-share uint)
    (shares-to-sell uint)
  )
  (begin
    (try! (assert-valid-price price-per-share))
    (try! (assert-valid-shares shares-to-sell))
    (ok true)
  )
)

;; Comprehensive validation for share transfer
(define-public (validate-share-transfer
    (amount uint)
    (sender-balance uint)
  )
  (begin
    (try! (assert-valid-shares amount))
    (asserts! (>= sender-balance amount) err-invalid-amount)
    (ok true)
  )
)

;; Utility functions for range checking
(define-read-only (is-in-range (value uint) (min-val uint) (max-val uint))
  (and (>= value min-val) (<= value max-val))
)

(define-read-only (is-positive (value uint))
  (> value u0)
)

(define-read-only (is-percentage (value uint))
  (and (>= value u0) (<= value u100))
)

;; Validation for batch operations
(define-public (validate-batch-transfer
    (amounts (list 10 uint))
    (total-available uint)
  )
  (let
    (
      (total-requested (fold + amounts u0))
    )
    (asserts! (<= total-requested total-available) err-invalid-amount)
    (ok true)
  )
)

;; Address validation
(define-public (assert-valid-address (address principal))
  (begin
    ;; In Clarity, all principals are valid by type system
    ;; But we can add custom checks if needed
    (asserts! (not (is-eq address tx-sender)) err-invalid-address)
    (ok true)
  )
)

;; Get validation constraints (for frontend)
(define-read-only (get-validation-constraints)
  {
    min-domain-length: min-domain-length,
    max-domain-length: max-domain-length,
    min-hash-length: min-hash-length,
    max-hash-length: max-hash-length,
    min-ticker-length: min-ticker-length,
    max-ticker-length: max-ticker-length,
    min-price: min-price,
    max-price: max-price,
    min-shares: min-shares,
    max-shares: max-shares,
    min-score: min-score,
    max-score: max-score
  }
)
