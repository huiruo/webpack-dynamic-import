import _ from 'lodash';
import print from './print'

function component() {
  const element = document.createElement('div');
  const button = document.createElement('button');
  const br = document.createElement('br');

  button.innerHTML = 'Click me and look at the console!';
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  element.appendChild(br);
  element.appendChild(button);


  // 动态加载
  // button.onclick = e => import(/* webpackChunkName: "print" */ './print').then(module => {
  //   const print = module.default;

  //   print();
  // });

  // 静态加载
  button.onclick = e => {
    print()
  };

  return element;
}

document.body.appendChild(component());
