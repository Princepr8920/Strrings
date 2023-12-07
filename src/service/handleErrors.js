class ApplicationError extends Error {
  constructor(message, status, success) {
    super();
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message || "Something went wrong. Please try again.";
    this.status = status || 500;
    this.success = success || false;
  }
}

class Verificaiton_Error extends ApplicationError {
  constructor(message, status, success) {
    super(message || "Something went wrong", status || 500, success || false);
  }
}
class Validation_Error extends ApplicationError {
  constructor(message, status, success) {
    super(message || "Something went wrong", status || 500, success || false);
  }
}

class Update_Error extends ApplicationError {
  constructor(message, status, success) {
    super(message || "Something went wrong", status || 500, success || false);
  }
}

class Service_Error extends ApplicationError {
  constructor(message, status, success) {
    super(message || "Something went wrong", status || 500, success || false);
  }
}

module.exports = {
  Verificaiton_Error,
  Validation_Error,
  Update_Error,
  Service_Error
};
