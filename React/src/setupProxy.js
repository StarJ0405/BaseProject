const { createProxyMiddleware } = require('http-proxy-middleware');


module.exports = function (app) {

  

  // app.use(
  //   '/payment',
  //   createProxyMiddleware({
  //     target: 'https://onlinetest.funpay.co.kr',
  //     changeOrigin: true,
  //     secure: false,
  //     logLevel: 'debug'
  //   })
  // );
    // app.use(
    // "/epost-api",
    // createProxyMiddleware({
    //   target: "http://eship.epost.go.kr", // ePost API 서버 URL
    //   changeOrigin: true,
    //   pathRewrite: {
    //     "^/epost-api": "", // /epost-api 경로를 제거하고 실제 API 경로로 변환
    //   },
    // })
  // );
};

