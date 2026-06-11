export class Language {
  constructor({ name, level } = {}) {
    this.name = name;
    this.level = level;
  }

  toJson() {
    return {
      name: this.name,
      level: this.level,
    };
  }

  static fromJson(data) {
    if (!data) return null;
    return new Language({
      name: data.name,
      level: data.level,
    });
  }
}
