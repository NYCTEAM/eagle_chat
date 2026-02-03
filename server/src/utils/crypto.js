const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * 验证以太坊签名
 * @param {string} message - 原始消息
 * @param {string} signature - 签名
 * @param {string} expectedAddress - 预期的钱包地址
 * @returns {boolean} - 验证是否成功
 */
function verifySignature(message, signature, expectedAddress) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} - 随机字符串
 */
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 哈希密码
 * @param {string} password - 明文密码
 * @returns {string} - 哈希后的密码
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * 生成邀请码
 * @param {number} length - 邀请码长度
 * @returns {string} - 邀请码
 */
function generateInviteCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * 加密消息（简单对称加密）
 * @param {string} text - 明文
 * @param {string} key - 密钥
 * @returns {string} - 密文
 */
function encryptMessage(text, key) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * 解密消息
 * @param {string} encrypted - 密文
 * @param {string} key - 密钥
 * @returns {string} - 明文
 */
function decryptMessage(encrypted, key) {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  verifySignature,
  generateRandomString,
  hashPassword,
  generateInviteCode,
  encryptMessage,
  decryptMessage
};
