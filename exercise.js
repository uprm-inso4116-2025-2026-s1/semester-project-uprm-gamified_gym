class Exercise {
  constructor(_name, _description, _repetitions, _calories_burned, _image_path) {
    this.name = _name;
    this.description = _description;
    this.repetitions = _repetitions;
    this.calories_burned = _calories_burned;
    this.image_path = _image_path;
  }
  // Getter and Setter for name
  getName() {
    return this.name;
  }

  setName(value) {
    this.name = value;
  }

  // Getter and Setter for description
  getDescription() {
    return this.description;
  }

  setDescription(value) {
    this.description = value;
  }

  // Getter and Setter for repetitions
  getRepetitions() {
    return this.repetitions;
  }

  setRepetitions(value) {
    this.repetitions = value;
  }

  // Getter and Setter for calories_burned
  getCalories_burned() {
    return this.calories_burned;
  }

  setCalories_burned(value) {
    this.calories_burned = value;
  }

  // Getter and Setter for image_path
  getImage_path() {
    return this.image_path;
  }

  setImage_path(value) {
    this.image_path = value;
  }
}
const exer = new Exercise(1,2,3,4,5)
console.log(exer)