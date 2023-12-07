const useragent = require("useragent"),
  emailSender = require("./confirmationCode"),
  sendNewEmail = new emailSender();

module.exports = async function Agent(data) {
  const { agentInfo, username, email } = data,
    userAgent = useragent.parse(agentInfo),
    info = {
      browser: `${userAgent.family}, ${userAgent.toVersion()}`,
      os: `${userAgent.os.family} ${userAgent.os.toVersion()}`,
    };

  let emailSent = await sendNewEmail.login_notification({
    username,
    email,
    secret: info,
  });

  return emailSent;
};
