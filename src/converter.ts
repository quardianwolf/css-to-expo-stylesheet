// CSS to React Native StyleSheet Converter

interface RNStyles {
  [key: string]: string | number | undefined;
}

interface ShadowStyle {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

// Convert Figma RGB to hex color
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert Figma RGBA to rgba string
export function rgbaToString(r: number, g: number, b: number, a: number): string {
  if (a === 1) {
    return rgbToHex(r, g, b);
  }
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a.toFixed(2)})`;
}

// Extract fill color from Figma node
export function extractFillColor(fills: readonly Paint[]): string | undefined {
  if (!fills || fills.length === 0) return undefined;

  const fill = fills[0];
  if (fill.type === 'SOLID' && fill.visible !== false) {
    const { r, g, b } = fill.color;
    const opacity = fill.opacity ?? 1;
    return rgbaToString(r, g, b, opacity);
  }

  // Handle gradient fills
  if (fill.type === 'GRADIENT_LINEAR' && fill.visible !== false) {
    // React Native doesn't support gradients natively
    // Return the first gradient stop color as fallback
    if (fill.gradientStops && fill.gradientStops.length > 0) {
      const stop = fill.gradientStops[0];
      const { r, g, b, a } = stop.color;
      return rgbaToString(r, g, b, a);
    }
  }

  return undefined;
}

// Extract stroke/border color
export function extractStrokeColor(strokes: readonly Paint[]): string | undefined {
  if (!strokes || strokes.length === 0) return undefined;

  const stroke = strokes[0];
  if (stroke.type === 'SOLID' && stroke.visible !== false) {
    const { r, g, b } = stroke.color;
    const opacity = stroke.opacity ?? 1;
    return rgbaToString(r, g, b, opacity);
  }

  return undefined;
}

// Convert Figma shadow to React Native shadow
export function convertShadow(effects: readonly Effect[]): ShadowStyle {
  const shadow: ShadowStyle = {};

  const dropShadow = effects.find(
    (e) => e.type === 'DROP_SHADOW' && e.visible !== false
  ) as DropShadowEffect | undefined;

  if (dropShadow) {
    const { r, g, b, a } = dropShadow.color;
    shadow.shadowColor = rgbaToString(r, g, b, 1);
    shadow.shadowOffset = {
      width: dropShadow.offset.x,
      height: dropShadow.offset.y,
    };
    shadow.shadowOpacity = Number(a.toFixed(2));
    shadow.shadowRadius = dropShadow.radius;
    // Android elevation (approximation)
    shadow.elevation = Math.ceil(dropShadow.radius / 2);
  }

  return shadow;
}

// Convert text alignment
export function convertTextAlign(align: string): string {
  const alignMap: { [key: string]: string } = {
    'LEFT': 'left',
    'CENTER': 'center',
    'RIGHT': 'right',
    'JUSTIFIED': 'justify',
  };
  return alignMap[align] || 'left';
}

// Convert text vertical alignment
export function convertTextVerticalAlign(align: string): string {
  const alignMap: { [key: string]: string } = {
    'TOP': 'flex-start',
    'CENTER': 'center',
    'BOTTOM': 'flex-end',
  };
  return alignMap[align] || 'flex-start';
}

// Convert Figma layout mode to flexDirection
export function convertLayoutMode(mode: string): string {
  return mode === 'HORIZONTAL' ? 'row' : 'column';
}

// Convert Figma primary axis align to justifyContent
export function convertPrimaryAxisAlign(align: string): string {
  const alignMap: { [key: string]: string } = {
    'MIN': 'flex-start',
    'CENTER': 'center',
    'MAX': 'flex-end',
    'SPACE_BETWEEN': 'space-between',
  };
  return alignMap[align] || 'flex-start';
}

// Convert Figma counter axis align to alignItems
export function convertCounterAxisAlign(align: string): string {
  const alignMap: { [key: string]: string } = {
    'MIN': 'flex-start',
    'CENTER': 'center',
    'MAX': 'flex-end',
    'BASELINE': 'baseline',
  };
  return alignMap[align] || 'flex-start';
}

// Convert font weight
export function convertFontWeight(weight: number | string): string {
  if (typeof weight === 'number') {
    return weight.toString();
  }

  const weightMap: { [key: string]: string } = {
    'Thin': '100',
    'ExtraLight': '200',
    'Light': '300',
    'Regular': '400',
    'Medium': '500',
    'SemiBold': '600',
    'Bold': '700',
    'ExtraBold': '800',
    'Black': '900',
  };

  // Handle composite names like "Bold Italic"
  for (const [name, value] of Object.entries(weightMap)) {
    if (weight.includes(name)) {
      return value;
    }
  }

  return '400';
}

// Convert font style (italic)
export function convertFontStyle(style: string): string | undefined {
  if (style.toLowerCase().includes('italic')) {
    return 'italic';
  }
  return undefined;
}

// Main function to extract styles from a Figma node
export function extractStyles(node: SceneNode): RNStyles {
  const styles: RNStyles = {};
  const isTextNode = node.type === 'TEXT';

  // Dimensions (skip for TEXT nodes - let them auto-size)
  if (!isTextNode) {
    if ('width' in node) {
      styles.width = Math.round(node.width);
    }
    if ('height' in node) {
      styles.height = Math.round(node.height);
    }
  }

  // Opacity
  if ('opacity' in node && node.opacity !== 1) {
    styles.opacity = Number(node.opacity.toFixed(2));
  }

  // Background color (fills) - NOT for TEXT nodes (they use color instead)
  if (!isTextNode && 'fills' in node && node.fills && Array.isArray(node.fills)) {
    const bgColor = extractFillColor(node.fills as readonly Paint[]);
    if (bgColor) {
      styles.backgroundColor = bgColor;
    }
  }

  // Border/Stroke - only add borderWidth if there's a visible stroke color
  if ('strokes' in node && node.strokes && Array.isArray(node.strokes)) {
    const borderColor = extractStrokeColor(node.strokes as readonly Paint[]);
    if (borderColor) {
      styles.borderColor = borderColor;
      // Only add borderWidth if we have a visible border color
      if ('strokeWeight' in node && typeof node.strokeWeight === 'number' && node.strokeWeight >= 0.5) {
        styles.borderWidth = Math.round(node.strokeWeight * 10) / 10;
      }
    }
  }

  // Border radius
  if ('cornerRadius' in node) {
    if (typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
      styles.borderRadius = node.cornerRadius;
    }
  }

  // Individual corner radii
  if ('topLeftRadius' in node && 'topRightRadius' in node &&
      'bottomLeftRadius' in node && 'bottomRightRadius' in node) {
    const tl = (node as any).topLeftRadius;
    const tr = (node as any).topRightRadius;
    const bl = (node as any).bottomLeftRadius;
    const br = (node as any).bottomRightRadius;

    if (tl !== tr || tl !== bl || tl !== br) {
      styles.borderTopLeftRadius = tl;
      styles.borderTopRightRadius = tr;
      styles.borderBottomLeftRadius = bl;
      styles.borderBottomRightRadius = br;
      delete styles.borderRadius;
    }
  }

  // Effects (shadows)
  if ('effects' in node && node.effects && node.effects.length > 0) {
    const shadowStyles = convertShadow(node.effects);
    Object.assign(styles, shadowStyles);
  }

  // Auto-layout (Flexbox)
  if ('layoutMode' in node && node.layoutMode !== 'NONE') {
    const autoLayoutNode = node as FrameNode;

    styles.flexDirection = convertLayoutMode(autoLayoutNode.layoutMode);
    styles.justifyContent = convertPrimaryAxisAlign(autoLayoutNode.primaryAxisAlignItems);
    styles.alignItems = convertCounterAxisAlign(autoLayoutNode.counterAxisAlignItems);

    if (autoLayoutNode.itemSpacing > 0) {
      styles.gap = autoLayoutNode.itemSpacing;
    }

    // Padding
    if (autoLayoutNode.paddingTop > 0) styles.paddingTop = autoLayoutNode.paddingTop;
    if (autoLayoutNode.paddingRight > 0) styles.paddingRight = autoLayoutNode.paddingRight;
    if (autoLayoutNode.paddingBottom > 0) styles.paddingBottom = autoLayoutNode.paddingBottom;
    if (autoLayoutNode.paddingLeft > 0) styles.paddingLeft = autoLayoutNode.paddingLeft;

    // Simplify padding
    const pTop = styles.paddingTop;
    const pRight = styles.paddingRight;
    const pBottom = styles.paddingBottom;
    const pLeft = styles.paddingLeft;

    // All sides equal
    if (pTop === pRight && pTop === pBottom && pTop === pLeft && pTop) {
      delete styles.paddingTop;
      delete styles.paddingRight;
      delete styles.paddingBottom;
      delete styles.paddingLeft;
      styles.padding = pTop;
    }
    // Vertical and horizontal equal
    else if (pTop === pBottom && pLeft === pRight && pTop && pLeft) {
      delete styles.paddingTop;
      delete styles.paddingRight;
      delete styles.paddingBottom;
      delete styles.paddingLeft;
      styles.paddingVertical = pTop;
      styles.paddingHorizontal = pLeft;
    }
  }

  // Text styles
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;

    // Font family
    if (textNode.fontName && typeof textNode.fontName !== 'symbol') {
      styles.fontFamily = textNode.fontName.family;

      // Font weight and style from font name
      const fontStyle = textNode.fontName.style;
      styles.fontWeight = convertFontWeight(fontStyle);

      const italic = convertFontStyle(fontStyle);
      if (italic) {
        styles.fontStyle = italic;
      }
    }

    // Font size
    if (typeof textNode.fontSize === 'number') {
      styles.fontSize = textNode.fontSize;
    }

    // Line height
    if (textNode.lineHeight && typeof textNode.lineHeight !== 'symbol') {
      if (textNode.lineHeight.unit === 'PIXELS') {
        styles.lineHeight = textNode.lineHeight.value;
      } else if (textNode.lineHeight.unit === 'PERCENT' && typeof textNode.fontSize === 'number') {
        styles.lineHeight = Math.round((textNode.lineHeight.value / 100) * textNode.fontSize);
      }
    }

    // Letter spacing (skip if 0 or very small)
    if (textNode.letterSpacing && typeof textNode.letterSpacing !== 'symbol') {
      let spacing = 0;
      if (textNode.letterSpacing.unit === 'PIXELS') {
        spacing = textNode.letterSpacing.value;
      } else if (textNode.letterSpacing.unit === 'PERCENT' && typeof textNode.fontSize === 'number') {
        spacing = (textNode.letterSpacing.value / 100) * textNode.fontSize;
      }
      // Only add if non-zero
      if (Math.abs(spacing) > 0.01) {
        styles.letterSpacing = Math.round(spacing * 100) / 100;
      }
    }

    // Text alignment (skip if 'left' - it's the default)
    if (typeof textNode.textAlignHorizontal === 'string' && textNode.textAlignHorizontal !== 'LEFT') {
      styles.textAlign = convertTextAlign(textNode.textAlignHorizontal);
    }

    // Text color (from fills)
    if (textNode.fills && Array.isArray(textNode.fills)) {
      const textColor = extractFillColor(textNode.fills as readonly Paint[]);
      if (textColor) {
        styles.color = textColor;
      }
    }

    // Text decoration
    if (textNode.textDecoration === 'UNDERLINE') {
      styles.textDecorationLine = 'underline';
    } else if (textNode.textDecoration === 'STRIKETHROUGH') {
      styles.textDecorationLine = 'line-through';
    }

    // Text transform
    if (textNode.textCase === 'UPPER') {
      styles.textTransform = 'uppercase';
    } else if (textNode.textCase === 'LOWER') {
      styles.textTransform = 'lowercase';
    } else if (textNode.textCase === 'TITLE') {
      styles.textTransform = 'capitalize';
    }
  }

  return styles;
}

// Format styles as React Native StyleSheet
export function formatAsStyleSheet(styles: RNStyles, name: string = 'container'): string {
  const entries = Object.entries(styles).filter(([_, v]) => v !== undefined);

  if (entries.length === 0) {
    return `const styles = StyleSheet.create({\n  ${name}: {},\n});`;
  }

  const styleLines = entries.map(([key, value]) => {
    if (typeof value === 'object') {
      // Handle shadowOffset
      const objStr = JSON.stringify(value);
      return `    ${key}: ${objStr},`;
    }
    if (typeof value === 'string') {
      return `    ${key}: '${value}',`;
    }
    return `    ${key}: ${value},`;
  });

  return `const styles = StyleSheet.create({
  ${name}: {
${styleLines.join('\n')}
  },
});`;
}

// Format as inline style object
export function formatAsInlineStyle(styles: RNStyles): string {
  const entries = Object.entries(styles).filter(([_, v]) => v !== undefined);

  if (entries.length === 0) {
    return 'style={{}}';
  }

  const styleLines = entries.map(([key, value]) => {
    if (typeof value === 'object') {
      return `  ${key}: ${JSON.stringify(value)},`;
    }
    if (typeof value === 'string') {
      return `  ${key}: '${value}',`;
    }
    return `  ${key}: ${value},`;
  });

  return `style={{
${styleLines.join('\n')}
}}`;
}

// Format as object only (for adding to existing styles.ts)
export function formatAsObjectOnly(styles: RNStyles, name: string = 'container'): string {
  const entries = Object.entries(styles).filter(([_, v]) => v !== undefined);

  if (entries.length === 0) {
    return `${name}: {},`;
  }

  const styleLines = entries.map(([key, value]) => {
    if (typeof value === 'object') {
      const objStr = JSON.stringify(value);
      return `  ${key}: ${objStr},`;
    }
    if (typeof value === 'string') {
      return `  ${key}: '${value}',`;
    }
    return `  ${key}: ${value},`;
  });

  return `${name}: {
${styleLines.join('\n')}
},`;
}
