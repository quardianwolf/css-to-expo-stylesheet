import {
  extractStyles,
  formatAsStyleSheet,
  formatAsInlineStyle,
  formatAsObjectOnly,
} from './converter';

// Get a clean name from node name (camelCase)
function getStyleName(nodeName: string): string {
  return nodeName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, (c) => c.toLowerCase()) || 'container';
}

// Codegen event handler
figma.codegen.on('generate', (event) => {
  const node = event.node;
  const styles = extractStyles(node);
  const styleName = getStyleName(node.name);

  return [
    {
      language: 'JAVASCRIPT',
      code: formatAsStyleSheet(styles, styleName),
      title: 'StyleSheet.create',
    },
    {
      language: 'JAVASCRIPT',
      code: formatAsObjectOnly(styles, styleName),
      title: 'Object Only',
    },
    {
      language: 'JAVASCRIPT',
      code: formatAsInlineStyle(styles),
      title: 'Inline Style',
    },
  ];
});
