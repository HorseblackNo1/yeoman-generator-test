var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
    this.intputs = {
      'name': args[0]
    }

    // // Next, add your custom code
    // this.option("babel"); // This method adds support for a `--babel` flag
  }
  writing() {
    // this.log('writing...');
    if (this.intputs.length == 0) {
      console.log('parameter is empty.')
    } else {
      const tmpl = this.templatePath('page3.html')
      const output = this.destinationPath('page3-'+this.intputs.name+'.html')
      const context = this.intputs
      this.fs.copyTpl(tmpl, output, context)
    }
  }
};
