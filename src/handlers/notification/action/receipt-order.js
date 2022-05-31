import Mailer from '../../../clients/mailer';
import HtmlTemplate, { htmlCompile } from '../../template';
import { sendMailHepler } from '~/routes/utils/mailer';
import {
  getCacheSettings,
  getSettingValue,
} from '~/routes/utils/setting-cache';
import { SETTING_KEY } from '~/routes/constants/master-data';

/**
 * @param {Object} deps
 * @param {Mailer} deps.emailClient
 * @param {HtmlTemplate} deps.htmlTemplate
 */
export default ({ emailClient, cache, models }) => ({
  pushNotif: async ({ sendTo, data }) => {
    const settings = await getCacheSettings({ cache, models });
    const title =
      getSettingValue(settings, SETTING_KEY.EMAIL_TEMPLATE_RECEIPT_TITLE) || '';
    const emailTemplate =
      getSettingValue(
        settings,
        SETTING_KEY.EMAIL_TEMPLATE_RECEIPT_ACCOUNT_TEMPLATE,
      ) || '';
    const emailBody = htmlCompile(emailTemplate, data);

    return sendMailHepler(
      { emailClient, cache, models },
      sendTo,
      title,
      emailBody,
    );
  },
});
