const fs = require('fs');
const path = require('path');

const ajvFilePath = path.resolve(
  __dirname,
  '../node_modules/@eslint/eslintrc/lib/shared/ajv.js'
);

console.log('[Fix] 正在修复 @eslint/eslintrc 的 Ajv 兼容性问题...');

if (!fs.existsSync(ajvFilePath)) {
  console.log('[Fix] 文件不存在，跳过: ' + ajvFilePath);
  process.exit(0);
}

const originalContent = fs.readFileSync(ajvFilePath, 'utf-8');

const fixedContent = originalContent
  .replace(
    /const ajv = new Ajv\(\{[\s\S]*?\}\);/,
    `const ajv = new Ajv({
        meta: false,
        useDefaults: true,
        validateSchema: false,
        verbose: true,
        ...additionalOptions
    });`
  )
  .replace(
    /ajv\.addMetaSchema\(metaSchema\);\s*\n?\s*\/\/ eslint-disable-next-line[\s\S]*?ajv\._opts\.defaultMeta = metaSchema\.id;/,
    `try {
        ajv.addMetaSchema(metaSchema);
    } catch (e) {
        // Ignore draft-04 meta-schema registration errors in ajv 8+
    }
    
    // Ajv 8.x compatibility: safely set defaultMeta
    if (ajv._opts) {
        ajv._opts.defaultMeta = metaSchema.id;
    } else if (ajv.defaultMeta !== undefined) {
        try {
            ajv.defaultMeta = metaSchema.id;
        } catch (e) {
            // Ignore
        }
    }`
  );

if (fixedContent !== originalContent) {
  fs.writeFileSync(ajvFilePath, fixedContent, 'utf-8');
  console.log('[Fix] ✅ Ajv 兼容性修复完成: ' + ajvFilePath);
} else {
  console.log('[Fix] ⚠️  文件内容已修复，无需再次修改');
}

console.log('[Fix] 修复完成!');
