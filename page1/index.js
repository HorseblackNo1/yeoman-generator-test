var Generator = require("yeoman-generator");

module.exports = class extends Generator {
  writing() {
    // this.log('writing...');
    this.fs.write(
        this.destinationPath('page1.txt'),
        'page1...'
    )
  }
};
