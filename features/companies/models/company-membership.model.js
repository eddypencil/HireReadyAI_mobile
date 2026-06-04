class CompanyMembership {
    constructor(companyId, profileId, permissions) {
        this.companyId = companyId,
            this.profileId = profileId,
            this.permissions = permissions
    }

    toSupaBaseForm() {
        return {
            company_id: this.companyId,
            profile_id: this.profileId,
            permissions: this.permissions
        }
    }
}
