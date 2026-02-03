const QRCode = require('qrcode');

/**
 * 生成二维码
 * @param {Object} data - 要编码的数据
 * @returns {Promise<string>} - Base64编码的二维码图片
 */
async function generateQRCode(data) {
  try {
    const dataString = JSON.stringify(data);
    const qrCodeDataURL = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
}

/**
 * 生成用户二维码
 * @param {Object} user - 用户对象
 * @returns {Promise<string>} - 二维码
 */
async function generateUserQRCode(user) {
  const data = {
    type: 'user',
    address: user.address,
    nickname: user.nickname,
    avatar: user.avatar
  };
  return await generateQRCode(data);
}

/**
 * 生成群聊二维码
 * @param {Object} group - 群聊对象
 * @returns {Promise<string>} - 二维码
 */
async function generateGroupQRCode(group) {
  const data = {
    type: 'group',
    groupId: group._id.toString(),
    name: group.name,
    inviteCode: group.inviteCode
  };
  return await generateQRCode(data);
}

/**
 * 生成会议二维码
 * @param {Object} meeting - 会议对象
 * @returns {Promise<string>} - 二维码
 */
async function generateMeetingQRCode(meeting) {
  const data = {
    type: 'meeting',
    meetingId: meeting._id.toString(),
    title: meeting.title,
    link: meeting.link,
    scheduledTime: meeting.scheduledTime
  };
  return await generateQRCode(data);
}

/**
 * 解析二维码数据
 * @param {string} qrData - 二维码数据字符串
 * @returns {Object} - 解析后的数据
 */
function parseQRCodeData(qrData) {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error('QR Code parsing error:', error);
    return null;
  }
}

module.exports = {
  generateQRCode,
  generateUserQRCode,
  generateGroupQRCode,
  generateMeetingQRCode,
  parseQRCodeData
};
