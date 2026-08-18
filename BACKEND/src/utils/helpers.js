const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 25))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

const formatPagination = (count, page, limit) => ({
  total: count,
  page,
  limit,
  total_pages: Math.ceil(count / limit),
  has_next: page < Math.ceil(count / limit),
  has_prev: page > 1
})


module.exports = { hashPassword, comparePassword, generateToken, verifyToken, getPaginationParams, formatPagination };