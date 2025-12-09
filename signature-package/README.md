# Portfolio Signature Component

This package provides a drop-in React component that displays a "Made by Paulo Wender" badge. When hovered or clicked, it reveals a list of other projects developed by Paulo Wender, fetched dynamically from his portfolio API.

## Installation

You can install this package directly from the repository (if configured) or simply copy the `SignatureBadge.tsx` file into your project.

## Usage

Import the component and add it to your application's root layout or footer.

```tsx
import { SignatureBadge } from './path/to/SignatureBadge';

export default function Layout({ children }) {
  return (
    <body>
      {children}
      <SignatureBadge />
    </body>
  );
}
```

### Props

- `apiUrl` (optional): URL to the portfolio projects API. Defaults to the production URL.
- `userId` (optional): Filter projects by a specific user ID if the API supports it.

## Features

- **Floating Badge**: Fixed to the bottom-right corner.
- **Responsive**: Works on desktop (hover) and mobile (click).
- **Dynamic**: Fetches latest projects from the backend.
- **Zero-Conflict**: Uses inline styles to avoid CSS clashes.
