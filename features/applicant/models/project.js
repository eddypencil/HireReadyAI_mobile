export class Project {
  constructor({ name, description, technologies, images, url } = {}) {
    this.name = name;
    this.description = description;
    this.technologies = technologies || [];
    this.images = images || [];
    this.url = url;
  }

  toJson() {
    return {
      name: this.name,
      description: this.description,
      technologies: this.technologies,
      images: this.images,
      url: this.url,
    };
  }

  static fromJson(data) {
    if (!data) return null;
    return new Project({
      name: data.name,
      description: data.description,
      technologies: data.technologies,
      images: data.images,
      url: data.url,
    });
  }
}
