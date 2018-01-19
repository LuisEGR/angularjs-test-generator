# AngularJS Jasmine test generator

This is a simple CLI application to facilitate the creation of Jasmine test for AngularJS

## Instalation

Via git:
```shell 
git clone git+https://github.com/LuisEGR/angularjs-test-generator.git
cd angularjs-test-generator
npm install -g
```

Vía npm: **(not yet available)**
```shell 
npm install -g angularjs-test-generator
```

## Use

Simply go to the directory of your component, which must have these files:
  * ./my-component/module.js
  * ./my-component/component.js
  * ./my-component/controller.js
  * ./my-component/view.html

```shell
cd myApp/components/my-component/
gentest
```

this will create the file ```component.spec.js```,  **if it already exists it will be replaced**.

#### CLI Arguments

argument | defualt | description | example
--- | --- | --- | ---
`-o` | `component.spec.js` | destination file | gentest -o spec/myout.spec.js
  
  
---
## Attention!

This script requires you to have your project with this configuration:

- Webpack module builder
- ES6 Project, with ES6 modules (babel-preset-env^)  
- Karma test runner
- ESLint and .eslint.json file
---

### TODO

- [x] Components  
- [ ] Directives  
- [ ] Filters  
- [ ] Services  


If you have any problem with this script please open a new issue describing the problem and how to replicate it.
