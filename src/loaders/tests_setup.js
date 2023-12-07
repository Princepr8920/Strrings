const chai = require("chai"),
  chaiHttp = require("chai-http"),
  should = chai.should();
  chai.use(chaiHttp);

  module.exports = {chai,should}