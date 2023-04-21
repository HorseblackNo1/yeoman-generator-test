var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  writing() {
    // this.log('writing...');
    const tmpl = this.templatePath('page2.html')
    const output = this.destinationPath('page2.html')
    const context = {
        name: "page2data", 
    }
    this.fs.copyTpl(tmpl, output, context)
  }
};
