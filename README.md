# CSS to Expo StyleSheet

A Figma Codegen plugin that converts Figma design styles directly to React Native / Expo StyleSheet format.

## Features

- Converts Figma node styles to React Native StyleSheet
- Appears in Figma Dev Mode's Code Panel (alongside CSS, iOS, Android)
- Supports multiple output formats:
  - `StyleSheet.create` - Full StyleSheet wrapper
  - `Object Only` - Just the style object (for adding to existing styles.ts)
  - `Inline Style` - JSX inline style format

### Supported Properties

| Category | Properties |
|----------|------------|
| **Layout** | width, height, flexDirection, justifyContent, alignItems, gap |
| **Spacing** | padding, paddingVertical, paddingHorizontal, paddingTop/Right/Bottom/Left |
| **Colors** | backgroundColor, color, borderColor |
| **Borders** | borderWidth, borderRadius, borderTopLeftRadius, etc. |
| **Shadows** | shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation |
| **Typography** | fontFamily, fontSize, fontWeight, fontStyle, lineHeight, letterSpacing, textAlign, textDecorationLine, textTransform |
| **Other** | opacity |

## Installation

### From Figma Community (Recommended)

1. Open Figma and go to **Plugins** > **Browse plugins in Community**
2. Search for "CSS to Expo StyleSheet"
3. Click **Install**

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/css-to-expo-stylesheet.git
cd css-to-expo-stylesheet
```

2. Install dependencies:
```bash
npm install
```

3. Build the plugin:
```bash
npm run build
```

4. Import to Figma:
   - Open Figma Desktop
   - Go to **Plugins** > **Development** > **Import plugin from manifest...**
   - Select the `manifest.json` file from the project folder

5. For development with auto-rebuild:
```bash
npm run watch
```

## Usage

1. Open a Figma file in **Dev Mode** (toggle in top-right corner)
2. Select any layer/component
3. In the right panel, find the **Code** section
4. Click the dropdown (default: CSS) and select **React Native / Expo**
5. Copy the generated StyleSheet code

### Output Examples

**StyleSheet.create:**
```javascript
const styles = StyleSheet.create({
  button: {
    width: 330,
    height: 55,
    backgroundColor: '#ffffff',
    borderColor: '#d4d4d4',
    borderWidth: 1.5,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Object Only:**
```javascript
button: {
  width: 330,
  height: 55,
  backgroundColor: '#ffffff',
  // ...
},
```

**Inline Style:**
```javascript
style={{
  width: 330,
  height: 55,
  backgroundColor: '#ffffff',
  // ...
}}
```

## Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check if the issue already exists in [Issues](https://github.com/yourusername/css-to-expo-stylesheet/issues)
2. If not, create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Figma node type (Frame, Text, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Open a new issue with the `enhancement` label
2. Describe the feature and its use case
3. If possible, include examples of expected output

### Pull Requests

1. Fork the repository
2. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

3. Make your changes and test locally in Figma

4. Commit with clear messages:
```bash
git commit -m "feat: add support for gradient backgrounds"
git commit -m "fix: correct border radius calculation"
git commit -m "docs: update README with new examples"
```

5. Push and create a Pull Request

### Commit Message Convention

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Project Structure

```
css-to-expo-stylesheet/
├── manifest.json      # Figma plugin configuration
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── src/
│   ├── code.ts        # Plugin entry point
│   └── converter.ts   # Style conversion logic
└── dist/              # Built files (generated)
```

## Known Limitations

- Gradient fills return the first color as fallback (React Native requires `expo-linear-gradient`)
- Mixed text styles within a single text node are not supported
- Percentage-based dimensions are converted to pixels

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built for the React Native / Expo community to speed up design-to-code workflows.
