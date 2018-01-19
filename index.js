#!/usr/bin/env node
'use strict';
// AngularJS Jasmine Test Generator
// Author: Luis E. González R. (@LuisEGR)
// Version: 0.0.1
let fs = require('fs');
// let process = require('process');
let minimist = require('minimist');
let CLIEngine = require('eslint').CLIEngine;
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
if (parser.hasFile('fixtures.js')) {
  specContent.push(`import * as testData from './fixtures.js';`);
}
if (parser.hasFile('view.html')) {
  specContent.push(`import templateURL from './view.html';`);
  specContent.push(functionGetSync);
  specContent.push(``);
}
specContent.push(`describe('dentro del componente ${_name}', () => {`);
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
    ` describe('Al llamar la función ${_functionsCtrl[i]}()', () => {`);
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

console.log("Module: " + _module);
console.log("Type: " + _type);
console.log("Name: " + _name + "/" + _htmlTag);
console.log("Bindings: " + Object.keys(_bindings).join(','));
console.log("Functions: " + _functionsCtrl.join(','));

let res = specContent.join('\n');
// console.log('Spec:', res);

let fw = fs.createWriteStream(destFile);
let ver = cli.executeOnText(res);
// console.log("output:",ver);
fw.write(ver.results[0].output);
console.log("Jasmine test created on: '"+destFile+"'");
