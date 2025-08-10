# Lexend Font Setup

This application uses **Lexend** as the primary font family for a modern, clean, and highly readable typography experience.

## Font Configuration

### 1. Google Fonts Import
The Lexend font is imported from Google Fonts with all weight variants (100-900):
```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');
```

### 2. Base Font Family
Lexend is set as the default font family for all HTML elements:
```css
html, body, h1, h2, h3, h4, h5, h6, p, span, div, button, input, textarea, select, label, a {
  font-family: 'Lexend', sans-serif;
}
```

### 3. Tailwind CSS Integration
The font is properly configured in `tailwind.config.js`:
```javascript
fontFamily: {
  'sans': ['Lexend', 'sans-serif'],
  'serif': ['Lexend', 'serif'],
  'mono': ['Lexend', 'monospace'],
  'lexend': ['Lexend', 'sans-serif'],
}
```

## Available Font Weights

- `font-thin` - Weight 100
- `font-extralight` - Weight 200
- `font-light` - Weight 300
- `font-normal` - Weight 400
- `font-medium` - Weight 500
- `font-semibold` - Weight 600
- `font-bold` - Weight 700
- `font-extrabold` - Weight 800
- `font-black` - Weight 900

## Custom Font Classes

Additional utility classes are available:
- `.font-lexend` - Base Lexend font
- `.font-lexend-light` - Light weight
- `.font-lexend-normal` - Normal weight
- `.font-lexend-medium` - Medium weight
- `.font-lexend-semibold` - Semi-bold weight
- `.font-lexend-bold` - Bold weight
- `.font-lexend-extrabold` - Extra-bold weight
- `.font-lexend-black` - Black weight

## Usage Examples

### In JSX Components
```jsx
// Using Tailwind classes
<h1 className="text-3xl font-bold">Title</h1>
<p className="text-base font-medium">Body text</p>

// Using custom classes
<span className="font-lexend-bold">Bold text</span>
<div className="font-lexend-light">Light text</div>
```

### In CSS
```css
.my-component {
  font-family: 'Lexend', sans-serif;
  font-weight: 600;
}
```

## Performance Optimization

The font is preloaded for better performance:
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap" as="style">
```

## Browser Support

Lexend is supported in all modern browsers and gracefully falls back to system fonts if needed.

## Why Lexend?

- **Readability**: Designed specifically for improved reading performance
- **Modern**: Clean, contemporary design that fits modern applications
- **Versatile**: Multiple weights for various use cases
- **Accessibility**: Optimized for screen readers and accessibility tools
- **Performance**: Efficient font loading and rendering
