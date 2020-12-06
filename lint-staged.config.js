const globby = require('globby');

module.exports = {
  '*': allFiles => {
    const match = globby.sync(allFiles, ['*.js', '*.ts', '*.jsx', '*.tsx', '*.json']);

    const lintTask = [];

    const cmds = match
      .map(file => {
        const targetDir = file.split(__dirname)[1].split('/')[1];

        if (!lintTask.includes(targetDir)) {
          lintTask.push(targetDir);
          return `bin/lint ${targetDir}`;
        }
      }).filter(cmd => {
        return !!cmd
      })

    return cmds.concat([`git add ${lintTask.join(' ')}`])
  },
};
