# Google News CLI

A dependency-free command-line interface to fetch and search the latest news from Google News.

## Features

- **Blazing Fast & Lightweight**: Zero external npm dependencies. Uses native Node.js fetch and regex-based parsing.
- **Top Stories**: Gets the latest global headlines instantly.
- **Search Feed**: Look up news on any specific query or keyword.
- **Topic Feeds**: Filter news by topics like Technology, Sports, Business, Science, and more.
- **ANSI Color Styling**: Clean, beautifully formatted output in your terminal.

## Requirements

- Node.js v18.0.0 or higher.

## Installation & Setup

1. Clone or copy these files into a directory.
2. Make the script executable:
   ```bash
   chmod +x index.js
   ```
3. (Optional) Link it globally to run as `gnews`:
   ```bash
   npm link
   ```
   *Note: If npm is not globally configured, you can run it directly with Node.js.*

## Usage

Run the script directly using Node:

```bash
node index.js
```

### Options

* **Get Help Menu**:
  ```bash
  node index.js --help
  # or
  node index.js -h
  ```

* **Search News**:
  ```bash
  node index.js --search "quantum computing"
  # or
  node index.js -s "artificial intelligence"
  ```

* **Filter by Topic**:
  ```bash
  node index.js --topic technology
  # or using abbreviations
  node index.js -t sports
  ```
  *Available Topics:* `world` (w), `nation` (n), `business` (b), `technology` (tech/t), `entertainment` (ent/e), `sports` (sp), `science` (sci/sc), `health` (h).

* **Limit Article Count**:
  ```bash
  node index.js -t business -l 5
  ```
