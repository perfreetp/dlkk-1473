export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/materials/index',
    'pages/filling/index',
    'pages/voice/index',
    'pages/progress/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2BA471',
    navigationBarTitleText: '年检申报助手',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#2BA471',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页导办',
      },
      {
        pagePath: 'pages/materials/index',
        text: '材料清单',
      },
      {
        pagePath: 'pages/filling/index',
        text: '分步填报',
      },
      {
        pagePath: 'pages/voice/index',
        text: '语音帮助',
      },
      {
        pagePath: 'pages/progress/index',
        text: '进度查询',
      },
    ],
  },
});
