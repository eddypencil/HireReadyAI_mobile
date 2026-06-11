export class Education {
  constructor({ level, university, faculty, major, startYear, endYear, grade } = {}) {
    this.level = level;
    this.university = university;
    this.faculty = faculty;
    this.major = major;
    this.startYear = startYear;
    this.endYear = endYear;
    this.grade = grade;
  }

  toJson() {
    return {
      level: this.level,
      university: this.university,
      faculty: this.faculty,
      major: this.major,
      start_year: this.startYear,
      end_year: this.endYear,
      grade: this.grade,
    };
  }

  static fromJson(data) {
    if (!data) return null;
    return new Education({
      level: data.level,
      university: data.university,
      faculty: data.faculty,
      major: data.major,
      startYear: data.start_year,
      endYear: data.end_year,
      grade: data.grade,
    });
  }
}
