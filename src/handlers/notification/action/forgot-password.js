import { htmlCompile } from '~/handlers/template';
import { SETTING_KEY } from '~/routes/constants/master-data';
import { sendMailHepler } from '~/routes/utils/mailer';
import {
  getCacheSettings,
  getSettingValue,
} from '~/routes/utils/setting-cache';

export default ({ emailClient, cache, models }) => ({
  pushNotif: async ({ sender, password, name }) => {
    const settings = await getCacheSettings({ cache, models });
    const title =
      getSettingValue(
        settings,
        SETTING_KEY.EMAIL_TEMPLATE_FORGOT_PASSWORD_TITLE,
      ) || '';
    const emailTemplate =
      getSettingValue(
        settings,
        SETTING_KEY.EMAIL_TEMPLATE_FORGOT_PASSWORD_TEMPLATE,
      ) || '';
    const emailBody = htmlCompile(emailTemplate, { password, name });

    return sendMailHepler(
      { emailClient, cache, models },
      sender,
      title,
      emailBody,
    );
  },
});
