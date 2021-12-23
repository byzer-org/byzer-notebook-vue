# webapp

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Change global color

  add some change in element.variables.scss
  then
1. switch node to v11
2. npm rebuild node-sass
3. node_modules/.bin/et

### use icon in project
- single color svg
  1. upload svg(s) to iconfont(https://www.iconfont.cn/manage/index?manage_type=myprojects&projectId=3053543)
  2. download to local
  3. replace files in /src/assets/iconfont
  4. replace the class `.iconfont` with `[class^="el-ksd-icon-"], [class*=" el-ksd-icon-"]`
- multi color svg
  1. add .svg file to /src/icons
  2. use svg-icon component in project




### Notes
[![Node](https://img.shields.io/badge/Node-14-green.svg?style=plastic)](https://nodejs.org/en/)
[![npm](https://img.shields.io/badge/npm-6-blue.svg?style=plastic)]()
