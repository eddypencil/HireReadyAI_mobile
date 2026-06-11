export class Certificate {
  constructor({ name, date, organization, field, image } = {}) {
    this.name = name;
    this.date = date;
    this.organization = organization;
    this.field = field;
    this.image = image;
  }

  toJson() {
    return {
      name: this.name,
      date: this.date,
      organization: this.organization,
      field: this.field,
      image: this.image,
    };
  }

  static fromJson(data) {
    if (!data) return null;
    return new Certificate({
      name: data.name,
      date: data.date,
      organization: data.organization,
      field: data.field,
      image: data.image,
    });
  }
}
