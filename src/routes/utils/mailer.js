import { SETTING_KEY } from '../constants/master-data';
import { getCacheSettings, getSettingValue } from './setting-cache';

export const sendMailHepler = async (
  { emailClient, cache, models },
  sender,
  title,
  emailBody,
) => {
  const settings = await getCacheSettings({ cache, models });
  const config = {
    publicName: getSettingValue(
      settings,
      SETTING_KEY.EMAIL_PROVIDER_MAILER_PUBLIC_NAME,
    ),
    senderName: getSettingValue(
      settings,
      SETTING_KEY.EMAIL_PROVIDER_MAILER_SENDER_NAME,
    ),
    host: getSettingValue(settings, SETTING_KEY.EMAIL_PROVIDER_MAILER_HOST),
    port: getSettingValue(settings, SETTING_KEY.EMAIL_PROVIDER_MAILER_PORT),
    auth: {
      user: getSettingValue(
        settings,
        SETTING_KEY.EMAIL_PROVIDER_MAILER_USERNAME,
      ),
      pass: getSettingValue(
        settings,
        SETTING_KEY.EMAIL_PROVIDER_MAILER_PASSWORD,
      ),
    },
    secure: true,
  };
  return emailClient.sendMailv2(config, sender, title, emailBody);
};

export default sendMailHepler;
