export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/sport/index',
    'pages/stats/index',
    'pages/mine/index',
    'pages/login/index',
    'pages/register/index',
    'pages/forgot-password/index',
    'pages/wechat-bind/index',
    'pages/sport-detail/index',
    'pages/goal-setting/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '运动记录',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f6f7'
  }
})
