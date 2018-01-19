let fs = require('fs');

class ParserAJS{
  constructor(config) {
    this.path = config.path;
    if(this.path){
      this.files = fs.readdirSync(this.path);
      this.cwd = this.path.split('/').pop();
      this.bindings = this.getBindings();
    }
  };

  getCammelCase(str) {
    return str.replace(/-([a-z])/g, (g) => {
      return g[1].toUpperCase();
    });
  };

  fromCammelCase(str) {
    return str.replace(/([A-Z])/g, (g) => {
      return '-' + g.toLowerCase();
    });
  };

  getName() {
    // let fullPath = __dirname;
    // let path = this.dirname.split('/');
    // let cwd = path[path.length-1];
    let name = this.getCammelCase(this.cwd);
    return name;
  };
  
  
  
  getHTMLTag() {
    // let fullPath = __dirname;
    // let path = this.dirname.split('/');
    // let cwd = path[path.length-1];
    return this.cwd.toLowerCase();
  };
  
  getType() {
    let type = undefined;
    let supportedTypes = ['directive', 'component', 'filter'];
    let items = this.files.map((name) => name.split('.')[0]);
    supportedTypes.some((_type) => {
      if (items.indexOf(_type) !== -1) {
        type = _type;
        return true;
      };
    });
    return type;
  };
  
  hasFile(file) {
    return this.files.indexOf(file) !== -1;
  };
  
  getModuleName() {
    let fromPos = 0;
    let toPos = 0;
    let moduleData;

    if (!this.hasFile('module.js')) {
      return 'MODULE_NAME_NOT_FOUND';
    } else {
      moduleData = fs.readFileSync('module.js', {encoding: 'utf-8'});
      fromPos = moduleData.indexOf(' .module(') + 10;
      toPos = fromPos;
      let actualChar = '';
      while (/['"`]/.test(actualChar) == false) {
        actualChar = moduleData.charAt(toPos);
        toPos += 1;
      };
    }
    return moduleData.slice(fromPos, toPos - 1);
  };
  
  getBindings() {
    let componentData;
    if (!this.hasFile('component.js')) {
      return [];
    } else {
      componentData = fs.readFileSync('component.js', {encoding: 'utf-8'});
      let fromPos = componentData.search('bindings');
      let toPos = fromPos;
      let actualChar = '';
      while (/[}]/.test(actualChar) == false) {
        actualChar = componentData.charAt(toPos);
        toPos += 1;
      }
      let binds;
      binds = eval(`binds = { ${componentData.slice(fromPos, toPos)} }`);
      return binds.bindings;
    }
  };
  
  getBindingScope(bindings, bind) {
    let tipo = bindings[bind];
    tipo = tipo.match(/[<|@|&]/);
    switch (tipo[0]) {
    case '<': return 'testData.'+bind; break;
    case '&': return '(data) => {}'; break;
    case '@': return 'abc'; break;
    }
    return `''`;
  };
  
  getBindingsHTML(bindings, bind) {
    let tipo = bindings[bind];
    tipo = tipo.match(/[<|@|&]/);
    switch (tipo[0]) {
    case '<': return bind + 'Test'; break;
    case '&': return bind + 'Test(data)'; break;
    case '@': return bind + 'Test'; break;
    }
    return `''`;
  };
  
  getFunctionsCtrl() {
    let controllerData;
    if (!this.hasFile('controller.js')) {
      return [];
    } else {
      controllerData = fs.readFileSync('controller.js', {encoding: 'utf-8'});
      let funcs = controllerData.match(/vm.[a-zA-Z$ ]{2,}[=(]\s*(\(|f){1}/g);
      if(!funcs || !funcs.length) return [];
      funcs = funcs.map((fun) => {
        return fun.substr(0, fun.length - 2).replace(/\s\=|(\()|(vm\.)/g, '');
      });
      return funcs;
    }
  };
};


module.exports = ParserAJS;
