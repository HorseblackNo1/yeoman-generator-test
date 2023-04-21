var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Page name:',
        default: this.appname,
      },
    ])
    .then(answers => {
      // console.log(answers)
      this.intputs = answers
    })
  }
  writing() {
    // this.log('writing...');
    const templates = [
      './page4.html',
      './page4.js',
      './page4.css',
    ]
    var para = this.intputs.name
    templates.forEach(item => {
      this.fs.copyTpl(
        this.templatePath(item), 
        this.destinationPath(item.replace('page4', 'pages/'+para+'/'+para)), 
        this.intputs
      )
    })
  }
};
