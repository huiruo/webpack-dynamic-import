## 作为优化方式之一
懒加载或者按需加载，是一种很好的优化网页或应用的方式。
这种方式实际上是先把你的代码在一些逻辑断点处分离开，然后在一些代码块中完成某些操作后，立即引用或即将引用另外一些新的代码块。这样加快了应用的初始加载速度，减轻了它的总体体积，因为某些代码块可能永远不会被加载。

官方文档：
https://webpack.docschina.org/guides/code-splitting#dynamic-imports

```
import() 调用会在内部用到 promises。如果在旧版本浏览器中（例如，IE 11）使用 import()，记得使用一个 polyfill 库（例如 es6-promise 或 promise-polyfill），来 shim Promise。
```

### webpack.config.js
```javaScript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

### dynamic-import\src\index.js
```javaScript
function getComponent() {

  return import('lodash').then(({ default: _ }) => {
    const element = document.createElement('div');

    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;
  })
    .catch((error) => 'An error occurred while loading the component');
}

getComponent().then((component) => {
  document.body.appendChild(component);
});
```

将会生成：
```
index.bundle.js
vendors-node_modules_lodash_lodash_js.bundle.js
```

### 由于 import() 会返回一个 promise，因此它可以和 async 函数一起使用。下面是如何通过 async 函数简化代码：
```javaScript
async function getComponent() {
  const element = document.createElement('div');
  const { default: _ } = await import('lodash');
  element.innerHTML = _.join(['Hello 123', 'webpack'], ' ');
  return element;
}
getComponent().then((component) => {
  document.body.appendChild(component);
});
```


## 预获取/预加载模块(prefetch/preload module)
https://webpack.docschina.org/guides/code-splitting#dynamic-imports
在声明 import 时，使用下面这些内置指令，可以让 webpack 输出 "resource hint(资源提示)"，来告知浏览器：
* prefetch(预获取)：将来某些导航下可能需要的资源
* preload(预加载)：当前导航下可能需要资源

下面这个 prefetch 的简单示例中，有一个 HomePage 组件，其内部渲染一个 LoginButton 组件，然后在点击后按需加载 LoginModal 组件。
```javaScript
// LoginButton.js
//...
import(/* webpackPrefetch: true */ './path/to/LoginModal.js');
```
这会生成 <link rel="prefetch" href="login-modal-chunk.js"> 并追加到页面头部，指示着浏览器在闲置时间预取 login-modal-chunk.js 文件。


## 与 prefetch 指令相比，preload 指令有许多不同之处：
* preload chunk 会在父 chunk 加载时，以并行方式开始加载。prefetch chunk 会在父 chunk 加载结束后开始加载。

* preload chunk 具有中等优先级，并立即下载。prefetch chunk 在浏览器闲置时下载。

* preload chunk 会在父 chunk 中立即请求，用于当下时刻。prefetch chunk 会用于未来的某个时刻。

* 浏览器支持程度不同

下面这个简单的 preload 示例中，有一个 Component，依赖于一个较大的 library，所以应该将其分离到一个独立的 chunk 中。

我们假想这里的图表组件 ChartComponent 组件需要依赖一个体积巨大的 ChartingLibrary 库。它会在渲染时显示一个 LoadingIndicator(加载进度条) 组件，然后立即按需导入 ChartingLibrary：
```javaScript
// ChartComponent.js
//...
import(/* webpackPreload: true */ 'ChartingLibrary');
```

在页面中使用 ChartComponent 时，在请求 ChartComponent.js 的同时，还会通过 <link rel="preload"> 请求 charting-library-chunk。假定 page-chunk 体积比 charting-library-chunk 更小，也更快地被加载完成，页面此时就会显示 LoadingIndicator(加载进度条) ，等到 charting-library-chunk 请求完成，LoadingIndicator 组件才消失。这将会使得加载时间能够更短一点，因为只进行单次往返，而不是两次往返。尤其是在高延迟环境下。
