// サンプルのgetRequester関数
export const getRequester = (data) => {
  // 実装
  return { ...data, requester: { id: '12345', name: 'テストユーザー' } };
};