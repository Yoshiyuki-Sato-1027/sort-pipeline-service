// サンプルのsendResponse関数
export const sendResponse = (data) => {
  // 実装
  return { 
    statusCode: 200, 
    body: { 
      success: true, 
      data: data.stitchFile 
    } 
  };
};