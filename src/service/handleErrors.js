class ApplicationError extends Error {
  constructor(message, status) {
    super();
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message || "Something went wrong. Please try again.";
    this.status = status || 500;
  }
}

class Signup_Error extends ApplicationError {
  constructor(message, status) {
    super(message || "Something went wrong", status || 500);
  }
}

class Identification_Error extends ApplicationError {
  constructor(message, status) {
    super(message || "Something went wrong", status || 500);
  }
}

class Verificaiton_Error extends ApplicationError {
  constructor(message, status) {
    super(message || "Something went wrong", status || 500);
  }
}
class Validation_Error extends ApplicationError {
  constructor(message, status) {
    super(message || "Something went wrong", status || 500);
  }
}

class Update_Error extends ApplicationError {
  constructor(message, status) {
    super(message || "Something went wrong", status || 500);
  }
}

module.exports = { Signup_Error, Identification_Error, Verificaiton_Error, Validation_Error,Update_Error};
