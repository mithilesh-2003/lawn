const { ServerError } = require("../error");
const { verifyToken } = require("../utils");

exports.authentication = async (req, res, data) => {
  try {
    const bearerToken = req.headers.authorization
    if (!bearerToken) {
      throw new ServerError(403, "no authentication supplied")
    }
    const [authType, token] = bearerToken.split(" ")
    if (authType !== 'Bearer') {
      throw new ServerError(403, "invalid authentication method")
    }
    const tokenData = verifyToken(token)
    req.tokenData = tokenData
  } catch (e) {
    throw new ServerError(403, e.message)
  }
  return { next: true }
};

exports.userAuthorization = async (req, res, data) => {
  console.log('checking user authorization');
  return { next: true };
};

exports.employeeAuthorization = (...roles) => {
  return async (req, res, data) => {
    if (!roles.includes(req.tokenData.role)) {
      throw new ServerError(403, "you are not authorized to perfrom this action. contact admin")
    }
    return { next: true }
  }
}
