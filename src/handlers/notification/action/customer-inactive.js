import { EMAIL_TEMPLATE_CUSTOMER_IN_ACTIVE } from '~/handlers/template/type';
import { sendMailHepler } from '~/routes/utils/mailer';

export default ({ emailClient, htmlTemplate, cache, models }) => ({
  pushNotif: async ({ sender, name, data }) => {
    const templateEngine = htmlTemplate.factory(
      EMAIL_TEMPLATE_CUSTOMER_IN_ACTIVE,
    );
    const emailBody = templateEngine.render({ ...data, name });
    return sendMailHepler(
      { emailClient, cache, models },
      sender,
      'ESPP - Active account',
      emailBody,
    );
    // return emailClient.sendMail(sender, 'ESPP - Inactive account', emailBody);
  },
});
