class CustomError extends Error {
    constructor(message, errorNumber) {
      super(message); // Call the parent constructor with the message
      this.name = 'CustomError'; // Set the error name
      this.errorNumber = errorNumber; // Assign the custom error number
    }
}
export default CustomError;