// server/utils.js
function extractJsonCodeBlocks(text) {
    if (!text) return [];
    const blocks = [];
    const codeBlockRe = /```json\s*([\s\S]*?)```/g;
    let m;
    while ((m = codeBlockRe.exec(text)) !== null) {
      const raw = m[1];
      try {
        const parsed = JSON.parse(raw);
        blocks.push(parsed);
      } catch (e) {
        // ignore parse errors
      }
    }
    return blocks;
  }
  
  module.exports = { extractJsonCodeBlocks };
  