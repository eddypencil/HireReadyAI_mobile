export class Skill {
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
    return new Skill({
      name: data.name,
      level: data.level,
    });
  }
}
