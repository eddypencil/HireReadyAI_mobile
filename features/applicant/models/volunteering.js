export class Volunteering {
  constructor({ organization, role, start, end, description } = {}) {
    this.organization = organization;
    this.role = role;
    this.start = start;
    this.end = end;
    this.description = description;
  }

  toJson() {
    return {
      organization: this.organization,
      role: this.role,
      start: this.start,
      end: this.end,
      description: this.description,
    };
  }

  static fromJson(data) {
    if (!data) return null;
    return new Volunteering({
      organization: data.organization,
      role: data.role,
      start: data.start,
      end: data.end,
      description: data.description,
    });
  }
}
