;; O.R.B.I.T.E.R. Security Contract
;; Access control and safety mechanisms

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u500))
(define-constant err-unauthorized (err u501))
(define-constant err-reentrancy (err u502))
(define-constant err-paused (err u503))
(define-constant err-not-admin (err u504))

;; Data Variables
(define-data-var emergency-paused bool false)
(define-data-var admin-count uint u1)

;; Data Maps
(define-map admins
  { admin: principal }
  { authorized: bool, added-at: uint }
)

(define-map reentrancy-locks
  { user: principal, contract: (string-ascii 64) }
  { locked: bool }
)

(define-map contract-permissions
  { contract: (string-ascii 64), function: (string-ascii 64) }
  { allowed: bool, paused: bool }
)

;; Initialize contract owner as admin
(map-set admins
  { admin: contract-owner }
  { authorized: true, added-at: u0 }
)

;; Read-only functions
(define-read-only (is-admin (address principal))
  (default-to false
    (get authorized (map-get? admins { admin: address }))
  )
)

(define-read-only (is-emergency-paused)
  (ok (var-get emergency-paused))
)

(define-read-only (is-locked (user principal) (contract (string-ascii 64)))
  (default-to false
    (get locked (map-get? reentrancy-locks { user: user, contract: contract }))
  )
)

(define-read-only (is-function-allowed (contract (string-ascii 64)) (function (string-ascii 64)))
  (match (map-get? contract-permissions { contract: contract, function: function })
    perm (and (get allowed perm) (not (get paused perm)))
    true ;; Default to allowed if not explicitly set
  )
)

;; Reentrancy protection
(define-public (acquire-lock (contract (string-ascii 64)))
  (let
    (
      (user tx-sender)
    )
    ;; Check if already locked
    (asserts! (not (is-locked user contract)) err-reentrancy)
    
    ;; Acquire lock
    (map-set reentrancy-locks
      { user: user, contract: contract }
      { locked: true }
    )
    
    (ok true)
  )
)

(define-public (release-lock (contract (string-ascii 64)))
  (let
    (
      (user tx-sender)
    )
    ;; Release lock
    (map-set reentrancy-locks
      { user: user, contract: contract }
      { locked: false }
    )
    
    (ok true)
  )
)

;; Access control
(define-public (verify-admin (address principal))
  (begin
    (asserts! (is-admin address) err-not-admin)
    (ok true)
  )
)

(define-public (verify-owner (address principal))
  (begin
    (asserts! (is-eq address contract-owner) err-owner-only)
    (ok true)
  )
)

(define-public (verify-not-paused)
  (begin
    (asserts! (not (var-get emergency-paused)) err-paused)
    (ok true)
  )
)

(define-public (verify-function-allowed (contract (string-ascii 64)) (function (string-ascii 64)))
  (begin
    (asserts! (is-function-allowed contract function) err-unauthorized)
    (ok true)
  )
)

;; Admin management
(define-public (add-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    
    (map-set admins
      { admin: new-admin }
      { authorized: true, added-at: block-height }
    )
    
    (var-set admin-count (+ (var-get admin-count) u1))
    
    (print {
      event: "admin-added",
      admin: new-admin
    })
    
    (ok true)
  )
)

(define-public (remove-admin (admin principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (is-eq admin contract-owner)) err-unauthorized) ;; Can't remove owner
    
    (map-set admins
      { admin: admin }
      { authorized: false, added-at: block-height }
    )
    
    (var-set admin-count (- (var-get admin-count) u1))
    
    (print {
      event: "admin-removed",
      admin: admin
    })
    
    (ok true)
  )
)

;; Emergency controls
(define-public (emergency-pause)
  (begin
    (asserts! (is-admin tx-sender) err-not-admin)
    
    (var-set emergency-paused true)
    
    (print {
      event: "emergency-pause-activated",
      by: tx-sender
    })
    
    (ok true)
  )
)

(define-public (emergency-unpause)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    
    (var-set emergency-paused false)
    
    (print {
      event: "emergency-pause-deactivated",
      by: tx-sender
    })
    
    (ok true)
  )
)

;; Function permission management
(define-public (set-function-permission
    (contract (string-ascii 64))
    (function (string-ascii 64))
    (allowed bool)
  )
  (begin
    (asserts! (is-admin tx-sender) err-not-admin)
    
    (map-set contract-permissions
      { contract: contract, function: function }
      { allowed: allowed, paused: false }
    )
    
    (print {
      event: "function-permission-updated",
      contract: contract,
      function: function,
      allowed: allowed
    })
    
    (ok true)
  )
)

(define-public (pause-function
    (contract (string-ascii 64))
    (function (string-ascii 64))
  )
  (begin
    (asserts! (is-admin tx-sender) err-not-admin)
    
    (match (map-get? contract-permissions { contract: contract, function: function })
      perm (map-set contract-permissions
        { contract: contract, function: function }
        (merge perm { paused: true })
      )
      (map-set contract-permissions
        { contract: contract, function: function }
        { allowed: true, paused: true }
      )
    )
    
    (print {
      event: "function-paused",
      contract: contract,
      function: function
    })
    
    (ok true)
  )
)

(define-public (unpause-function
    (contract (string-ascii 64))
    (function (string-ascii 64))
  )
  (begin
    (asserts! (is-admin tx-sender) err-not-admin)
    
    (match (map-get? contract-permissions { contract: contract, function: function })
      perm (map-set contract-permissions
        { contract: contract, function: function }
        (merge perm { paused: false })
      )
      true
    )
    
    (print {
      event: "function-unpaused",
      contract: contract,
      function: function
    })
    
    (ok true)
  )
)

;; Utility functions for other contracts
(define-public (check-and-lock (contract (string-ascii 64)))
  (begin
    (try! (verify-not-paused))
    (try! (acquire-lock contract))
    (ok true)
  )
)

(define-public (unlock (contract (string-ascii 64)))
  (release-lock contract)
)
