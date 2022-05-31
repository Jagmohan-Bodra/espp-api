import { EMAIL_TEMPLATE_FORGET_PASSWORD } from '~/handlers/template/type';
import { sendMailHepler } from '~/routes/utils/mailer';

export default ({ emailClient, cache, models, htmlTemplate }) => ({
  pushNotif: async ({ sender, password, name }) => {
    const templateEngine = htmlTemplate.factory(EMAIL_TEMPLATE_FORGET_PASSWORD);
    const emailBody = templateEngine.render({ password, name, sender });
    return sendMailHepler(
      { emailClient, cache, models },
      sender,
      'ESPP - New Password',
      emailBody,
    );
    // return emailClient.sendMail(sender, 'ESPP - New Password', emailBody);
  },
});
