class Exercise {
  constructor(name, description, repetitions, calories_burned, image_path) {
    this.name = name;
    this.description = description;
    this.repetitions = repetitions;
    this.calories_burned = calories_burned;
    this.image_path = image_path;
  }
  // Getter and Setter for name
  get name() {
    return this.name;
  }

  set name(value) {
    this.name = value;
  }

  // Getter and Setter for description
  get description() {
    return this.description;
  }

  set description(value) {
    this.description = value;
  }

  // Getter and Setter for repetitions
  get repetitions() {
    return this.repetitions;
  }

  set repetitions(value) {
    this.repetitions = value;
  }

  // Getter and Setter for calories_burned
  get calories_burned() {
    return this.calories_burned;
  }

  set calories_burned(value) {
    this.calories_burned = value;
  }

  // Getter and Setter for image_path
  get image_path() {
    return this.image_path;
  }

  set image_path(value) {
    this.image_path = value;
  }
}
