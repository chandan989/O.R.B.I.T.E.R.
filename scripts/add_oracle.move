script {
    use orbiter::valuation;

    /// Add a new oracle to the valuation system
    /// This script should be run by an admin account
    fun add_oracle(admin: &signer, new_oracle: address) {
        valuation::add_oracle(admin, new_oracle);
    }
}