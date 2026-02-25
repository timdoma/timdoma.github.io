import { unified } from 'unified';
import uniorgParse from 'uniorg-parse';
import uniorgRehype from 'uniorg-rehype';
import rehypeStringify from 'rehype-stringify';
import fs from 'node:fs/promises';

export default function(eleventyConfig) {
  // 1. 기존 설정: 정적 자산 복사
  eleventyConfig.addPassthroughCopy({ "src/js": "js", "src/css": "css" });

  // 2. Org-mode (uniorg) 지원 설정
  eleventyConfig.addTemplateFormats("org");

  eleventyConfig.addExtension("org", {
    read: true,

    // Org 파일 상단의 #+ 설정을 데이터로 추출
getData: async function(inputPath) {
      const content = await fs.readFile(inputPath, 'utf-8');
      
      const processor = unified().use(uniorgParse);
      const tree = processor.parse(content);

      const data = {};
      if (tree.children) {
        tree.children
          .filter(node => node.type === 'keyword')
          .forEach(node => {
            const key = node.key.toLowerCase();
            const value = node.value;
            
            if (key === 'date') {
              data[key] = new Date(value);
            } else if (key === 'tags') {
              data[key] = value.split(/[,\s]+/).filter(Boolean);
            } else {
              data[key] = value;
            }
          });
      }

      // 기본 레이아웃 설정
      if (!data.layout) data.layout = "layouts/base.liquid";
      
      return data;
    },

    // Org 본문을 HTML로 변환
    compile: async function(inputContent) {
      const processor = unified()
        .use(uniorgParse)
        .use(uniorgRehype)
        .use(rehypeStringify);

      return async (data) => {
        const result = await processor.process(inputContent);
        return result.toString();
      };
    }
  });

  // 3. Eleventy 디렉토리 및 엔진 설정
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "liquid", "html", "org"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid"
  };
}
