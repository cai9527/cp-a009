export default defineAppConfig({
  pages: [
    'pages/index/index',
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
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
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
