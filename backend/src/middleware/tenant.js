const { prismaStorage } = require('../utils/db');

const injectTenantContext = (req, res, next) => {
  if (req.user) {
    // Run all subsequent operations within the user storage context
    prismaStorage.run(req.user, next);
  } else {
    next();
  }
};

module.exports = { injectTenantContext };
