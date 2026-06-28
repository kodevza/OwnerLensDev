# Migration note

This project was generated from the uploaded Hugo field-notes repo.

Migrated from the old repo:

- `content/notes/entra-ownership-evidence-signals/index.md`
- its local images/assets
- the field-note idea and code-copy behavior

Not migrated:

- Hugo layouts
- `hugo.toml`
- old Hugo homepage
- Hugo image shortcode/render hooks
- Hugo build workflow

The old Hugo shortcode:

```md
{{< img src="image.png" size="750x" alt="..." >}}
```

was converted to normal Markdown image syntax:

```md
![...](image.png)
```
