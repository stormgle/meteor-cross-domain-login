Package.describe({
  name: 'stormgle:cross-domain',
  version: '0.0.1',
  summary: 'Synchronize login states across domains sharing same accounts users database',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/stormgle/meteor-cross-domain-login.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3.2.4');

  /* dependencies */
  api.use('ecmascript');
  api.use('accounts-base');
  api.use('tracker');
  
  api.use('stormgle:util');

  api.mainModule('cross-domain.js','client');

});
