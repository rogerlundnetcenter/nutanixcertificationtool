module.exports = {
  packagerConfig: {
    name: 'CertStudy',
    executableName: 'certstudy',
    asar: true,
  },
  makers: [
    { name: '@electron-forge/maker-squirrel', config: {} },
    { name: '@electron-forge/maker-zip', platforms: ['darwin', 'linux'] },
    { name: '@electron-forge/maker-deb', config: {
      options: {
        maintainer: 'CertStudy',
        homepage: 'https://github.com/rogerlundnetcenter/nutanixcertificationtool',
        categories: ['Education'],
      }
    }},
    { name: '@electron-forge/maker-rpm', config: {} },
  ],
};
