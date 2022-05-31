import Mailer from '../../../clients/mailer';
import HtmlTemplate from '../../template';
import { EMAIL_TEMPLATE_SLIP_ORDER } from '~/handlers/template/type';
import { sendMailHepler } from '~/routes/utils/mailer';

/**
 * @param {Object} deps
 * @param {Mailer} deps.emailClient
 * @param {HtmlTemplate} deps.htmlTemplate
 */
export default ({ emailClient, htmlTemplate, cache, models }) => ({
  pushNotif: async ({ sendTo, data, title }) => {
    const templateEngine = htmlTemplate.factory(EMAIL_TEMPLATE_SLIP_ORDER);
    const emailBody = templateEngine.render(data);
    return sendMailHepler(
      { emailClient, cache, models },
      sendTo,
      title,
      emailBody,
    );
    // return emailClient.sendMail(sendTo, title, emailBody);
  },
});
