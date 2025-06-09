// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

var webpack = require('webpack'),
  path = require('path'),
  fs = require('fs'),
  config = require('../webpack.config'),
  ZipPlugin = require('zip-webpack-plugin');

delete config.chromeExtensionBoilerplate;

config.mode = 'production';

var packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

// v1.3.0 Platform Asset Verification
function verifyPlatformAssets() {
  console.log('🔍 Verifying platform assets for v1.3.0...');
  
  const requiredPlatformAssets = [
    'src/assets/img/icon-gpt.png',
    'src/assets/img/icon-gemini.png'
  ];
  
  const missingAssets = [];
  
  requiredPlatformAssets.forEach(assetPath => {
    if (!fs.existsSync(path.join(__dirname, '..', assetPath))) {
      missingAssets.push(assetPath);
    }
  });
  
  if (missingAssets.length > 0) {
    console.error('❌ Missing required platform assets:');
    missingAssets.forEach(asset => {
      console.error(`   - ${asset}`);
    });
    console.error('Please ensure all platform icons are present before building.');
    process.exit(1);
  } else {
    console.log('✅ All platform assets verified successfully');
  }
}

// Enhanced asset verification for all critical files
function verifyBuildAssets() {
  console.log('🔍 Verifying build assets...');
  
  const criticalAssets = [
    // Core extension files
    'src/manifest.json',
    'src/popup/popup.html',
    'src/popup/popup.ts',
    'src/content/content.ts',
    'src/background/background.ts',
    
    // Core UI assets
    'src/assets/img/icon-16.png',
    'src/assets/img/icon-48.png',
    'src/assets/img/icon-128.png',
    'src/assets/img/icon-logo.png',
    
    // Platform assets (v1.3.0)
    'src/assets/img/icon-gpt.png',
    'src/assets/img/icon-gemini.png'
  ];
  
  const missingCriticalAssets = [];
  
  criticalAssets.forEach(assetPath => {
    if (!fs.existsSync(path.join(__dirname, '..', assetPath))) {
      missingCriticalAssets.push(assetPath);
    }
  });
  
  if (missingCriticalAssets.length > 0) {
    console.error('❌ Missing critical build assets:');
    missingCriticalAssets.forEach(asset => {
      console.error(`   - ${asset}`);
    });
    console.error('Build cannot proceed without these files.');
    process.exit(1);
  } else {
    console.log('✅ All critical build assets verified');
  }
}

// Version-specific build validation
function validateBuildVersion() {
  console.log(`📦 Building ChatSeed v${packageInfo.version}...`);
  
  // Check if this is a platform-enabled version (1.3.0+)
  const version = packageInfo.version;
  const majorMinor = version.split('.').slice(0, 2).join('.');
  const versionNumber = parseFloat(majorMinor);
  
  if (versionNumber >= 1.3) {
    console.log('🌐 Platform support enabled (ChatGPT + Gemini)');
    verifyPlatformAssets();
  } else {
    console.log('💬 ChatGPT-only build (legacy mode)');
  }
}

// Run pre-build validations
console.log('🚀 Starting ChatSeed build process...');
validateBuildVersion();
verifyBuildAssets();

config.plugins = (config.plugins || []).concat(
  new ZipPlugin({
    filename: `${packageInfo.name}-${packageInfo.version}.zip`,
    path: path.join(__dirname, '../', 'zip'),
  })
);

webpack(config, function (err, stats) {
  if (err) {
    console.error('❌ Build failed with error:', err);
    throw err;
  }
  
  if (stats.hasErrors()) {
    console.error('❌ Build completed with errors:');
    console.error(stats.toString('errors-only'));
    process.exit(1);
  }
  
  if (stats.hasWarnings()) {
    console.warn('⚠️  Build completed with warnings:');
    console.warn(stats.toString('warnings-only'));
  }
  
  // Build success reporting
  const buildTime = stats.endTime - stats.startTime;
  console.log(`✅ Build completed successfully in ${buildTime}ms`);
  console.log(`📁 Output: build/ directory`);
  console.log(`📦 Package: zip/${packageInfo.name}-${packageInfo.version}.zip`);
  
  // Platform-specific success message
  const version = packageInfo.version;
  const versionNumber = parseFloat(version.split('.').slice(0, 2).join('.'));
  
  if (versionNumber >= 1.3) {
    console.log('🌐 Platform features included: ChatGPT + Gemini support');
    console.log('   - Platform detection enabled');
    console.log('   - Platform filtering available');
    console.log('   - Platform-specific UI elements included');
  }
  
  console.log('🎉 Ready for deployment!');
});