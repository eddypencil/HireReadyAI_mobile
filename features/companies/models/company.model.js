class Company {
    constructor(id, name, industry, size, logoUrl) {
        this.id = id,
            this.name = name,
            this.industry = industry,
            this.size = size,
            this.logoUrl = logoUrl
    }

    toSupaBaseForm() {
        return {
            name: this.name,
            industry: this.industry,
            size: this.size,
            logo_url: this.logoUrl
        }
    }
}