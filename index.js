#!/usr/bin/env node
'use strict';
// AngularJS Jasmine Test Generator
// Author: Luis E. González R. (@LuisEGR)
// Version: 0.0.3
const fs = require('fs');
const readline = require('readline');
const minimist = require('minimist');
const CLIEngine = require('eslint').CLIEngine;
let cli = new CLIEngine({
  envs: ['env'],
  fix: true,
  useEslintrc: true,
});

let ParserAJS = require('./parser');
let parser = new ParserAJS({
  path: process.cwd(),

});

let argv = minimist(process.argv.slice(2));
let destname = argv['o'] ||null;


let _htmlTag = parser.getHTMLTag();
let _name = parser.getName();
let _type = parser.getType();
let _module = parser.getModuleName();
let _bindings = parser.getBindings();
let _functionsCtrl = parser.getFunctionsCtrl();

let destFile = destname || _type + '.spec.js';
// console.log(_name);
// console.log(_type);

let functionGetSync = `
/**
 * @function getSync
 * @param  {string} path {Dirección del archivo}
 * @return {string} {Contenido del archivo}
 */
function getSync(path) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', path, false);
  xhr.send();
  return xhr.responseText;
};`;

let bindsAttrs = ``;
Object.keys(_bindings).forEach((binding) => {
  bindsAttrs +=
    `${parser.fromCammelCase(binding)}="${parser.getBindingsHTML(_bindings, binding)}" \n`;
});

let specContent = [];
if(Object.keys(_bindings).length){
  if (!parser.hasFile('fixtures.js')) {
    let f_fixtures = fs.createWriteStream('fixtures.js');
    Object.keys(_bindings).forEach((binding) => {
      f_fixtures.write(`export const ${binding} = {};\n`);
    });
  }
  specContent.push(`import * as testData from './fixtures.js';`);
}
if (parser.hasFile('view.html')) {
  specContent.push(`import templateURL from './view.html';`);
  specContent.push(functionGetSync);
  specContent.push(``);
}
specContent.push(`describe('Dentro del componente ${_name}', () => {`);
specContent.push(`let element;`);
specContent.push(`let ctrl;`);
specContent.push(`let $scope;`);
specContent.push(`let $compile;`);
specContent.push(`let $templateCache;`);
specContent.push(`let $httpBackend;`);
specContent.push(``);
specContent.push(`angular.mock.module.sharedInjector();`);
specContent.push(`beforeAll(angular.mock.module('${_module}'));`);
specContent.push(`beforeAll( inject(($injector) => {`);
specContent.push(`$scope = $injector.get('$rootScope').$new();`);
specContent.push(`$compile = $injector.get('$compile');`);
specContent.push(`$templateCache = $injector.get('$templateCache');`);
specContent.push(`$httpBackend = $injector.get('$httpBackend');`);
specContent.push(`$templateCache.put(templateURL, getSync(templateURL));`);
specContent.push(``);
specContent.push(`// Ignorar peticiones a templates de componentes anidados`);
specContent.push(`$httpBackend.when('GET', /\.html$/).respond(200, '');`);
specContent.push(``);
specContent.push(`//Data binding`);
Object.keys(_bindings).forEach((binding) => {
  specContent.push(
    `$scope.${binding}Test = ${parser.getBindingScope(_bindings, binding)};`);
});

specContent.push(``);
specContent.push(`element = angular.element(\`<${_htmlTag} 
${bindsAttrs}></${_htmlTag}>
\`);`);
specContent.push(``);
specContent.push(`$compile(element)($scope);`);
specContent.push(`$scope.$digest();`);
specContent.push(`ctrl = element.controller('${_name}');`);
specContent.push(`}));`);
specContent.push(``);

specContent.push(`it(\`debería estar definido su controlador\`, () => {
  expect(ctrl).toBeDefined();
});`);

specContent.push(``);
specContent.push(``);


for (let i = 0; i < _functionsCtrl.length; i++) {
  specContent.push(` // Función ${_functionsCtrl[i]}`);
  specContent.push(
    ` describe('al llamar la función ${_functionsCtrl[i]}()', () => {`);
  specContent.push(` beforeAll(() => {
      //dostuff
    ctrl.${_functionsCtrl[i]}();
  });`);
  specContent.push(` it(\`should\`, () => {
    fail('TEST_NOT_IMPLEMENTED');
  });`);
  specContent.push(`});\n`);
};
specContent.push(`})`);

console.log("\tModule: \t" + _module);
console.log("\tType: \t\t" + _type);
console.log("\tName: \t\t" + _name + "/" + _htmlTag);
console.log("\tBindings: \t" + Object.keys(_bindings).join(','));
console.log("\tFunctions: \t" + _functionsCtrl.join(','));

let res = specContent.join('\n');
// console.log('Spec:', res);


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


let writeFile = () => {
  fw = fs.createWriteStream(destFile);
  let ver = cli.executeOnText(res);
  fw.write(ver.results[0].output);
  console.log("Jasmine test created on: '"+destFile+"'");
  rl.close();
}


let fw = undefined;
let replaceFile = false;
if (!fs.existsSync(destFile)) {
  writeFile();
} else {
  rl.question(`'${destFile}' already exists, would you like to replace it? Y/N `, (answer) => {
    replaceFile = /[YySs]/.test(answer);
    rl.close();
    if(replaceFile){
      console.log(`${destFile} replaced!`);
      writeFile();
    }else{
      console.log('Run this command with -o option to set the output name');
    }
  });
}

