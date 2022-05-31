import Mailer from '../../../clients/mailer';
import HtmlTemplate, { htmlCompile } from '../../template';
import { SETTING_KEY } from '~/routes/constants/master-data';
import {
  getCacheSettings,
  getSettingValue,
} from '~/routes/utils/setting-cache';
import { sendMailHepler } from '~/routes/utils/mailer';

/**
 * @param {Object} deps
 * @param {Mailer} deps.emailClient
 * @param {HtmlTemplate} deps.htmlTemplate
 */
export default ({ emailClient, config, cache, models }) => ({
  pushNotif: async ({ data, approveLink, rejectLink, settings }) => {
    // const sendTo = config.APRAISER_EMAIL;
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
        SETTING_KEY.EMAIL_TEMPLATE_PAYMENT_LOCAL_BANK_TRANSFER_TITLE,
      ) || '';
    const emailTemplate =
      getSettingValue(
        settings,
        SETTING_KEY.EMAIL_TEMPLATE_PAYMENT_LOCAL_BANK_TRANSFER_TEMPLATE,
      ) || '';
    const emailBody = htmlCompile(emailTemplate, {
      approveLink,
      rejectLink,
      data,
    });
    return sendMailHepler(
      { emailClient, cache, models },
      sendTo,
      title,
      emailBody,
    );
  },
});
