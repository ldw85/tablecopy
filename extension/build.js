const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Build script for Table Export Pro Extension
 * Handles minification, optimization, and preparation for distribution
 */

class ExtensionBuilder {
  constructor() {
    this.srcDir = __dirname;
    this.distDir = path.join(__dirname, 'dist');
    this.buildDir = path.join(this.distDir, 'build');

    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }
    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir, { recursive: true });
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

  // 验证文件结构
  validateStructure() {
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
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }

    this.log('File structure validation passed', 'success');
  }

  // 验证manifest.json
  validateManifest() {
    try {
      const manifestPath = path.join(this.srcDir, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      const requiredFields = ['manifest_version', 'name', 'version', 'description'];
      const missingFields = requiredFields.filter(field => !manifest[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing manifest fields: ${missingFields.join(', ')}`);
      }

      if (manifest.manifest_version !== 3) {
        throw new Error('Extension must use Manifest V3');
      }

      this.log('Manifest validation passed', 'success');
      return manifest;
    } catch (error) {
      throw new Error(`Manifest validation failed: ${error.message}`);
    }
  }

  // 复制文件到构建目录
  copyFiles() {
    const filesToCopy = [
      'manifest.json',
      'background.js',
      'content.js',
      'popup.html',
      'popup.css',
      'popup.js',
      'injected.js'
    ];

    filesToCopy.forEach(file => {
      const srcPath = path.join(this.srcDir, file);
      const destPath = path.join(this.buildDir, file);

      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        this.log(`Copied ${file}`, 'info');
      }
    });

    // 复制icons目录
    const iconsSrc = path.join(this.srcDir, 'icons');
    const iconsDest = path.join(this.buildDir, 'icons');

    if (fs.existsSync(iconsSrc)) {
      this.copyDirectory(iconsSrc, iconsDest);
      this.log('Copied icons directory', 'info');
    }
  }

  // 复制目录
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);

      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  // 简单的JS压缩（移除注释和多余空格）
  minifyJS(content) {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
      .replace(/\/\/.*$/gm, '') // 移除单行注释
      .replace(/\s+/g, ' ') // 合并多余空格
      .replace(/;\s*}/g, ';}') // 优化分号
      .trim();
  }

  // 简单的CSS压缩
  minifyCSS(content) {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
      .replace(/\s+/g, ' ') // 合并空格
      .replace(/;\s*}/g, ';}') // 优化分号
      .replace(/\s*{\s*/g, '{') // 优化大括号
      .replace(/;\s*/g, ';') // 优化分号
      .trim();
  }

  // 优化构建文件
  optimizeFiles() {
    // 优化JavaScript文件
    const jsFiles = ['background.js', 'content.js', 'popup.js', 'injected.js'];
    jsFiles.forEach(file => {
      const filePath = path.join(this.buildDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const minified = this.minifyJS(content);
        fs.writeFileSync(filePath, minified);
        this.log(`Optimized ${file}`, 'info');
      }
    });

    // 优化CSS文件
    const cssPath = path.join(this.buildDir, 'popup.css');
    if (fs.existsSync(cssPath)) {
      const content = fs.readFileSync(cssPath, 'utf8');
      const minified = this.minifyCSS(content);
      fs.writeFileSync(cssPath, minified);
      this.log('Optimized popup.css', 'info');
    }
  }

  // 生成构建报告
  generateBuildReport() {
    const report = {
      buildTime: new Date().toISOString(),
      version: this.manifest.version,
      files: {},
      totalSize: 0
    };

    const files = fs.readdirSync(this.buildDir);
    files.forEach(file => {
      const filePath = path.join(this.buildDir, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const size = stats.size;
        report.files[file] = {
          size: size,
          sizeFormatted: this.formatFileSize(size)
        };
        report.totalSize += size;
      }
    });

    report.totalSizeFormatted = this.formatFileSize(report.totalSize);

    const reportPath = path.join(this.distDir, 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log('Build report generated', 'success');
    return report;
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 验证构建结果
  validateBuild() {
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
      !fs.existsSync(path.join(this.buildDir, file))
    );

    if (missingFiles.length > 0) {
      throw new Error(`Build validation failed - missing files: ${missingFiles.join(', ')}`);
    }

    // 验证manifest.json仍然有效
    try {
      const manifestPath = path.join(this.buildDir, 'manifest.json');
      JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      this.log('Build validation passed', 'success');
    } catch (error) {
      throw new Error(`Build validation failed - invalid manifest.json: ${error.message}`);
    }
  }

  // 主构建流程
  async build() {
    try {
      this.log('Starting build process...', 'info');

      this.validateStructure();
      this.manifest = this.validateManifest();

      this.log('Copying files...', 'info');
      this.copyFiles();

      this.log('Optimizing files...', 'info');
      this.optimizeFiles();

      this.log('Validating build...', 'info');
      this.validateBuild();

      const report = this.generateBuildReport();

      this.log(`Build completed successfully!`, 'success');
      this.log(`Total size: ${report.totalSizeFormatted}`, 'info');
      this.log(`Build location: ${this.buildDir}`, 'info');

      return report;
    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const builder = new ExtensionBuilder();
  builder.build().catch(error => {
    console.error('Build process failed:', error);
    process.exit(1);
  });
}

module.exports = ExtensionBuilder;