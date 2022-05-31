import { htmlCompile } from '~/handlers/template';
import { SETTING_KEY } from '~/routes/constants/master-data';
import { sendMailHepler } from '~/routes/utils/mailer';
import {
  getCacheSettings,
  getSettingValue,
} from '~/routes/utils/setting-cache';

export default ({ emailClient, cache, models }) => ({
  pushNotif: async ({ data }) => {
    const settings = await getCacheSettings({ cache, models });
    const sendTo = (
      getSettingValue(
        settings,
        SETTING_KEY.EMAIL_PROVIDER_NOTIFICATION_CONTACT_EVENT,
      ) || ''
    ).split(',');
    const title =
      getSettingValue(settings, SETTING_KEY.EMAIL_TEMPLATE_CONTACT_US_TITLE) ||
      '';
    const emailTemplate =
      getSettingValue(
        settings,
        SETTING_KEY.EMAIL_TEMPLATE_CONTACT_US_TEMPLATE,
      ) || '';
    const emailBody = htmlCompile(emailTemplate, { data });

    return sendMailHepler(
      { emailClient, cache, models },
      sendTo,
      title,
      emailBody,
    );
  },
});
