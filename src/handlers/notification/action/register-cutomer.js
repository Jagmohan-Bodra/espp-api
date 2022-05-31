import _ from 'lodash';
import Mailer from '../../../clients/mailer';
import HtmlTemplate from '../../template';
import { EMAIL_TEMPLATE_REGISTER_CUSTOMER } from '~/handlers/template/type';
import { decode, encode } from '~/routes/utils';
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
export default ({ emailClient, htmlTemplate, config, cache, models }) => ({
  pushNotif: async ({ approvalId, approveLink, rejectLink, data }) => {
    const { user, customer } = data;

    const templateData = {
      ..._.pick(customer, [
        'status',
        'internalNote',
        'promotionCoupon',
        'orderHistory',
        'addressBlockNo',
        'addressStresstName',
        'addressFloor',
        'addressUnitNo',
        'addressBuildingName',
        'addressPostCode',
        'addressCity',
        'addressState',
        'addressCountry',
        'financeSalutation',
        'financeFirstName',
        'financeLastName',
        'financeContactNo',
        'financeEmail',
        'companyName',
        'companyRegNo',
        'companyContactNo',
        'companyFax',
        'companyNatureOfBusiness',
        'remark',
        'designation',
        'contactNo',
        'personalEmail',
      ]),
      ..._.pick(user, [
        'salutation',
        'phone',
        'email',
        'firstName',
        'lastName',
      ]),
    };
    templateData._id = customer._id;
    templateData.user = user._id;

    // get sendTo
    const settings = await getCacheSettings({ cache, models });
    const sendTo = (
      getSettingValue(settings, SETTING_KEY.EMAIL_PROVIDER_APPRAISER_LIST) || ''
    ).split(',');

    const title = `${config.EMAIL_TITLE.REGISTER_CUSTOMER} ${templateData.firstName} ${templateData.lastName}`;
    const templateEngine = htmlTemplate.factory(
      EMAIL_TEMPLATE_REGISTER_CUSTOMER,
    );
    const token = encode(
      JSON.stringify({
        approvalId,
        approveLink,
        rejectLink,
      }),
    );

    const fontendLink = `${config.FRONT_END_LINK}?token=${token}`;
    const emailBody = templateEngine.render({
      fontendLink,
      approvalId,
      approveLink,
      data: templateData,
    });
    return sendMailHepler(
      { emailClient, cache, models },
      sendTo,
      title,
      emailBody,
    );
  },
});
