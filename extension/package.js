const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

/**
 * Packaging script for Table Export Pro Extension
 * Creates distribution packages for Chrome Web Store and Edge Add-ons
 */

class ExtensionPackager {
  constructor() {
    this.srcDir = path.join(__dirname, 'dist', 'build');
    this.distDir = path.join(__dirname, 'dist');
    this.packageDir = path.join(this.distDir, 'packages');

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.packageDir)) {
      fs.mkdirSync(this.packageDir, { recursive: true });
    }
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m'
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type] || ''}[${type.toUpperCase()}]${reset} ${message}`);
  }

  // 获取版本号
  getVersion() {
    try {
      const manifestPath = path.join(this.srcDir, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return manifest.version;
    } catch (error) {
      this.log('Could not read version from manifest, using default', 'warning');
      return '1.0.0';
    }
  }

  // 验证构建目录
  validateBuild() {
    if (!fs.existsSync(this.srcDir)) {
      throw new Error('Build directory not found. Please run build.js first.');
    }

    const requiredFiles = [
      'manifest.json',
      'background.js',
      'content.js',
      'popup.html',
      'popup.css',
      'popup.js',
      'injected.js'
    ];

    const missingFiles = requiredFiles.filter(file =>
      !fs.existsSync(path.join(this.srcDir, file))
    );

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files in build directory: ${missingFiles.join(', ')}`);
    }

    this.log('Build validation passed', 'success');
  }

  // 创建ZIP包
  createZipArchive(sourceDir, outputPath, excludePatterns = []) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // 最高压缩级别
      });

      output.on('close', () => {
        const size = archive.pointer();
        this.log(`Created ${path.basename(outputPath)} (${this.formatFileSize(size)})`, 'success');
        resolve(size);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // 添加目录内容
      archive.directory(sourceDir, false, (entry) => {
        // 应用排除模式
        for (const pattern of excludePatterns) {
          if (entry.name.match(pattern)) {
            return false; // 排除此文件
          }
        }
        return entry;
      });

      archive.finalize();
    });
  }

  // 创建Chrome Web Store包
  async createChromePackage(version) {
    const packageName = `table-export-pro-chrome-v${version}.zip`;
    const outputPath = path.join(this.packageDir, packageName);

    // Chrome Web Store 排除文件
    const excludePatterns = [
      /\.DS_Store$/,
      /Thumbs\.db$/,
      /\.git/,
      /node_modules/,
      /\.md$/, // 排除文档文件
      /^dist\//,
      /^packages\//
    ];

    await this.createZipArchive(this.srcDir, outputPath, excludePatterns);
    return outputPath;
  }

  // 创建Edge Add-ons包
  async createEdgePackage(version) {
    const packageName = `table-export-pro-edge-v${version}.zip`;
    const outputPath = path.join(this.packageDir, packageName);

    // Edge Add-ons 可能有不同的要求
    const excludePatterns = [
      /\.DS_Store$/,
      /Thumbs\.db$/,
      /\.git/,
      /node_modules/,
      /\.md$/,
      /^dist\//,
      /^packages\//
    ];

    await this.createZipArchive(this.srcDir, outputPath, excludePatterns);
    return outputPath;
  }

  // 创建源代码包（用于商店审核）
  async createSourcePackage(version) {
    const packageName = `table-export-pro-source-v${version}.zip`;
    const outputPath = path.join(this.packageDir, packageName);

    // 包含源代码和构建脚本
    const sourceDir = path.join(__dirname, 'src') || __dirname;
    const excludePatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /\.DS_Store$/,
      /Thumbs\.db$/
    ];

    await this.createZipArchive(sourceDir, outputPath, excludePatterns);
    return outputPath;
  }

  // 生成包信息
  generatePackageInfo(packages, version) {
    const info = {
      version: version,
      buildTime: new Date().toISOString(),
      packages: {}
    };

    packages.forEach(pkg => {
      const stats = fs.statSync(pkg.path);
      info.packages[pkg.name] = {
        filename: path.basename(pkg.path),
        size: stats.size,
        sizeFormatted: this.formatFileSize(stats.size),
        purpose: pkg.purpose
      };
    });

    return info;
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 验证包文件
  validatePackages(packages) {
    packages.forEach(pkg => {
      if (!fs.existsSync(pkg.path)) {
        throw new Error(`Package file not found: ${pkg.path}`);
      }

      const stats = fs.statSync(pkg.path);
      if (stats.size === 0) {
        throw new Error(`Package file is empty: ${pkg.path}`);
      }

      if (stats.size > 200 * 1024 * 1024) { // 200MB limit
        throw new Error(`Package file too large: ${pkg.path}`);
      }
    });

    this.log('Package validation passed', 'success');
  }

  // 生成发布说明
  generateReleaseNotes(version) {
    const notes = `# Table Export Pro v${version} Release Notes

## Package Information
- **Version**: ${version}
- **Build Date**: ${new Date().toISOString()}
- **Target Platforms**: Chrome Web Store, Edge Add-ons

## Installation Files
1. **Chrome Package**: For Chrome Web Store submission
2. **Edge Package**: For Edge Add-ons submission
3. **Source Package**: Complete source code for review

## Submission Checklist
### Chrome Web Store
- [ ] Upload \`table-export-pro-chrome-v${version}.zip\`
- [ ] Fill store listing information
- [ ] Set pricing and distribution
- [ ] Submit for review

### Edge Add-ons
- [ ] Upload \`table-export-pro-edge-v${version}.zip\`
- [ ] Fill store listing information
- [ ] Set pricing and distribution
- [ ] Submit for review

## Post-Submission
- Monitor review status
- Respond to reviewer feedback
- Update listing if needed
- Plan next version features

---
Generated by Table Export Pro Build System
`;

    const notesPath = path.join(this.packageDir, `release-notes-v${version}.md`);
    fs.writeFileSync(notesPath, notes);
    this.log('Release notes generated', 'info');

    return notesPath;
  }

  // 主打包流程
  async package() {
    try {
      this.log('Starting packaging process...', 'info');

      this.validateBuild();
      const version = this.getVersion();

      this.log(`Packaging version ${version}...`, 'info');

      const packages = [];

      // 创建Chrome包
      this.log('Creating Chrome package...', 'info');
      const chromePath = await this.createChromePackage(version);
      packages.push({
        name: 'chrome',
        path: chromePath,
        purpose: 'Chrome Web Store submission'
      });

      // 创建Edge包
      this.log('Creating Edge package...', 'info');
      const edgePath = await this.createEdgePackage(version);
      packages.push({
        name: 'edge',
        path: edgePath,
        purpose: 'Edge Add-ons submission'
      });

      // 创建源代码包
      this.log('Creating source package...', 'info');
      const sourcePath = await this.createSourcePackage(version);
      packages.push({
        name: 'source',
        path: sourcePath,
        purpose: 'Source code for review'
      });

      // 验证所有包
      this.log('Validating packages...', 'info');
      this.validatePackages(packages);

      // 生成包信息
      const packageInfo = this.generatePackageInfo(packages, version);
      const infoPath = path.join(this.packageDir, 'package-info.json');
      fs.writeFileSync(infoPath, JSON.stringify(packageInfo, null, 2));

      // 生成发布说明
      const releaseNotesPath = this.generateReleaseNotes(version);

      this.log('Packaging completed successfully!', 'success');
      this.log(`Packages location: ${this.packageDir}`, 'info');
      this.log(`Total packages created: ${packages.length}`, 'info');

      return {
        packages,
        packageInfo,
        infoPath,
        releaseNotesPath
      };

    } catch (error) {
      this.log(`Packaging failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const packager = new ExtensionPackager();
  packager.package().catch(error => {
    console.error('Packaging process failed:', error);
    process.exit(1);
  });
}

module.exports = ExtensionPackager;