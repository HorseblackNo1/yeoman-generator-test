var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Page name:',
        default: 'list',
      },
    ])
    .then(answers => {
      this.intputs = answers
    })
  }
  writing() {
    const templates = [
      './index.vue',
      './hooks.tsx',
      './types.ts',
    ]
    var para = this.intputs.name
    templates.forEach(item => {
      this.fs.copyTpl(
        this.templatePath(item),
        // this.destinationPath(item.replace('list', 'views/'+para+'/'+para)),
        this.destinationPath(`src/views/${para}/${item}`),
        this.intputs
      )
    })
  }
};
