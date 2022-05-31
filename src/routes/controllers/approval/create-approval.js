export const insertOneApproval = async ({ models, config }, data) => {
  const approval = await new models.Approval(data).save();
  const approvalId = approval._id.toHexString();

  const approveLink = `${config.APPROVAL_ROOT_LINK}/${approvalId}/approve`;
  const rejectLink = `${config.APPROVAL_ROOT_LINK}/${approvalId}/reject`;

  return { approvalId: approval._id.toHexString(), approveLink, rejectLink };
};

export default insertOneApproval;
