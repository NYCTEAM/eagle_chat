const { ethers } = require('ethers');

/**
 * 验证以太坊地址
 * @param {string} address - 钱包地址
 * @returns {boolean} - 是否有效
 */
function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * 验证消息长度
 * @param {string} message - 消息内容
 * @param {number} maxLength - 最大长度
 * @returns {boolean} - 是否有效
 */
function isValidMessageLength(message, maxLength = 5000) {
  return message && message.length > 0 && message.length <= maxLength;
}

/**
 * 验证昵称
 * @param {string} nickname - 昵称
 * @returns {boolean} - 是否有效
 */
function isValidNickname(nickname) {
  if (!nickname) return false;
  if (nickname.length < 1 || nickname.length > 50) return false;
  // 允许字母、数字、中文、下划线、空格
  const regex = /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/;
  return regex.test(nickname);
}

/**
 * 验证群名称
 * @param {string} name - 群名称
 * @returns {boolean} - 是否有效
 */
function isValidGroupName(name) {
  if (!name) return false;
  if (name.length < 1 || name.length > 100) return false;
  return true;
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱地址
 * @returns {boolean} - 是否有效
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * 清理HTML标签
 * @param {string} text - 输入文本
 * @returns {string} - 清理后的文本
 */
function sanitizeHTML(text) {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '');
}

/**
 * 验证文件类型
 * @param {string} mimetype - MIME类型
 * @param {Array} allowedTypes - 允许的类型列表
 * @returns {boolean} - 是否允许
 */
function isAllowedFileType(mimetype, allowedTypes) {
  return allowedTypes.includes(mimetype);
}

/**
 * 验证文件大小
 * @param {number} size - 文件大小（字节）
 * @param {number} maxSize - 最大大小（字节）
 * @returns {boolean} - 是否允许
 */
function isAllowedFileSize(size, maxSize) {
  return size <= maxSize;
}

module.exports = {
  isValidAddress,
  isValidMessageLength,
  isValidNickname,
  isValidGroupName,
  isValidEmail,
  sanitizeHTML,
  isAllowedFileType,
  isAllowedFileSize
};
