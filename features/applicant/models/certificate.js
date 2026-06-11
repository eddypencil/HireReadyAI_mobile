export class Certificate {
  constructor({ name, date, url, organization, field, image } = {}) {
    this.name = name;
    this.date = date;
    this.url = url;
    this.organization = organization;
    this.field = field;
    this.image = image;
  }

  toJson() {
    return {
      name: this.name,
      date: this.date,
      url: this.url,
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
      url: data.url,
      organization: data.organization,
      field: data.field,
      image: data.image,
    });
  }
}
