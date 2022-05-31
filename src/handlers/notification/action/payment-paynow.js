import Mailer from '../../../clients/mailer';
import HtmlTemplate, { htmlCompile } from '../../template';
import { SETTING_KEY } from '~/routes/constants/master-data';
import { getSettingValue } from '~/routes/utils/setting-cache';
import { sendMailHepler } from '~/routes/utils/mailer';

/**
 * @param {Object} deps
 * @param {Mailer} deps.emailClient
 * @param {HtmlTemplate} deps.htmlTemplate
 */
export default ({ emailClient, cache, models }) => ({
  pushNotif: async ({ data, approveLink, rejectLink, settings }) => {
    // get sendTo
    const sendTo = (
      getSettingValue(
        settings,
        SETTING_KEY.EMAIL_PROVIDER_NOTIFICATION_ORDER_EVENT,
      ) || ''
    ).split(',');

    const title =
      getSettingValue(
        settings,
        SETTING_KEY.EMAIL_TEMPLATE_PAYMENT_PAYNOW_TITLE,
      ) || '';
    const emailTemplate =
      getSettingValue(
        settings,
        SETTING_KEY.EMAIL_TEMPLATE_PAYMENT_PAYNOW_TEMPLATE,
      ) || '';
    const emailBody = htmlCompile(emailTemplate, {
      data,
      approveLink,
      rejectLink,
    });
    return sendMailHepler(
      { emailClient, cache, models },
      sendTo,
      title,
      emailBody,
    );
    // return emailClient.sendMail(sendTo, title, emailBody);
  },
});
