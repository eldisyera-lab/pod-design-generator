module.exports = {
  use: {
    launchOptions: {
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
    }
  },
  reporter: 'line'
};
