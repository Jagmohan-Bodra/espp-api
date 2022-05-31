import Models from '~/models';

const SETTING_CACHE_KEY = 'setting_model_list';
/**
 * @param {Object} deps
 * @param {Models} deps.models
 */
export const setCacheSettings = async ({ cache, models }) => {
  const settingsModel = await models.Setting.find({}).exec();
  const params = JSON.parse(JSON.stringify(settingsModel));
  await cache.setCache({ key: SETTING_CACHE_KEY, value: params });
  return params;
};

export const getCacheSettings = async ({ cache, models }) => {
  const settingCache = await cache.getCache({ key: SETTING_CACHE_KEY });
  if (settingCache) {
    return JSON.parse(settingCache);
  }

  const results = await setCacheSettings({ cache, models });
  return results;
};

export const getSettingValue = (settings = [], key) =>
  (settings.find((setting) => setting.key == key) || {}).value;
