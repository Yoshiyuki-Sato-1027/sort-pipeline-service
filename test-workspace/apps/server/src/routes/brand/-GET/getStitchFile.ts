// サンプルのgetStitchFile関数
export const getStitchFile = (data) => {
  // 実装
  return { ...data, stitchFile: { id: 'file1', content: 'テストファイル内容' } };
};