export class Experience {
  constructor({ title, companyName, industry, from, to, description } = {}) {
    this.title = title;
    this.companyName = companyName;
    this.industry = industry;
    this.from = from;
    this.to = to;
    this.description = description;
  }

  toJson() {
    return {
      title: this.title,
      company_name: this.companyName,
      industry: this.industry,
      from: this.from,
      to: this.to,
      description: this.description,
    };
  }

  static fromJson(data) {
    if (!data) return null;
    return new Experience({
      title: data.title,
      companyName: data.company_name,
      industry: data.industry,
      from: data.from,
      to: data.to,
      description: data.description,
    });
  }
}
