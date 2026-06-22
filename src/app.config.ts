export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/sport/index',
    'pages/stats/index',
    'pages/mine/index',
    'pages/login/index',
    'pages/register/index',
    'pages/forgot-password/index',
    'pages/sport-detail/index',
    'pages/goal-setting/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '运动记录',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F8FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/sport/index',
        text: '运动'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
