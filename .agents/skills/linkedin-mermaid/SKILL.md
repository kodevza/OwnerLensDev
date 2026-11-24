---
name: linkedin-mermaid
description: Eksportuje notatki Markdown na LinkedIn jako zwykły tekst i PNG Mermaid z przezroczystym tłem oraz podglądem white-and-black. Eksportuje też pojedyncze diagramy i generuje strony Astro z plików .mmd.md.
---

# Eksport Mermaid

Użyj skryptu [export.sh](scripts/export.sh) z tego skilla. Skrypt korzysta z [linkedin.json](linkedin.json) i zapisuje obrazy obok źródeł. Dla `diagram.mmd` tworzy `diagram.png`, a dla kolejnych bloków kodu z oznaczeniem `mermaid` w `artykul.md` tworzy `artykul-1.png`, `artykul-2.png` itd. Treść artykułu pozostaje bez zmian. Kolejny eksport nadpisuje obrazy o tych samych nazwach.

Skrypt używa dostępnego polecenia `mmdc` lub uruchamia Mermaid CLI przez `npm exec`. Do renderowania może użyć zainstalowanego Chromium.

Uruchom odpowiedni wariant z katalogu głównego repozytorium:

```bash
# Jeden diagram jako PNG
bash .agents/skills/linkedin-mermaid/scripts/export.sh "diagram.mmd"

# Wszystkie diagramy osadzone w artykule
bash .agents/skills/linkedin-mermaid/scripts/export.sh "artykul.md"

# Wszystkie pliki .mmd i .md bezpośrednio w podanym katalogu
bash .agents/skills/linkedin-mermaid/scripts/export.sh "katalog-diagramów"

# Jeden diagram jako SVG
bash .agents/skills/linkedin-mermaid/scripts/export.sh --svg "diagram.mmd"
```

Bez podania plików lub katalogu skrypt szuka plików `.mmd` i `.md` w bieżącym katalogu. Można też podać kilka plików w jednym wywołaniu. Pliki Markdown bez bloków Mermaid pomija.

PNG używa skali 2 i ustawienia rozmiaru 1600. Skrypt dobiera `--size` lub `-w` do wersji Mermaid CLI. W trybie `--linkedin` flowcharty, diagramy sekwencyjne i blokowe mieszczące się w limicie zachowują naturalne wymiary Mermaid przed przeskalowaniem w skali 2. Dzięki temu drukowany rozmiar etykiet strzałek jest wspólny dla tych diagramów. Oba formaty korzystają z natywnego tła `-b transparent` i wspólnej palety.

Eksport PNG nakłada ustawienia z [png.json](png.json), [png.css](png.css) i [png-sequence.css](png-sequence.css). Podgrafy mają szare ramki, większe odstępy i neutralne szare wypełnienie z 14% krycia. Domyślne boksy mają szare ramki i niebieskie wypełnienie `#367fcc` z 68% krycia. Tekst w domyślnych boksach i polach uczestników jest biały, półgruby i bez obrysu. Tytuły obszarów, etykiety połączeń i wiadomości w diagramach sekwencyjnych są półgrube, szare (`#7c7c7c`) i bez obrysu. Własne kolory boksów z diagramu mają pierwszeństwo.

Po każdym eksporcie PNG skrypt tworzy podgląd wszystkich diagramów z danego źródła w kolejności wystąpienia. Podgląd skaluje wszystkie obrazy w tej samej proporcji, żeby największy zmieścił się w panelu. Każdy wiersz pokazuje ten sam diagram na białym tle po lewej i na czarnym po prawej. Podgląd zapisuje się jako `white-and-black.png` w katalogu eksportu artykułu na LinkedIn albo jako `<nazwa-źródła>-white-and-black.png` obok pojedynczego źródła. Eksport PNG wymaga zależności repozytorium z `npm ci`.

Po eksporcie zawsze pokaż użytkownikowi podgląd white-and-black i podaj link do pełnego pliku. Do wstawienia w artykuł służą osobne PNG z przezroczystym tłem.

## Artykuł na LinkedIn

Uruchom z katalogu głównego repozytorium po zainstalowaniu zależności przez `npm ci`. Eksport trafia do `export/<nazwa-notatki>/`. Dla pliku `index.mmd.md` nazwą notatki jest nazwa jego katalogu.

```bash
bash .agents/skills/linkedin-mermaid/scripts/export.sh --linkedin \
  content/field-notes/governing-ai-agents-through-purpose-bound-access/index.mmd.md
```

Kolejny eksport aktualizuje tekst i diagramy w tym samym katalogu. Możesz też podać ścieżkę innego, nowego katalogu jako dodatkowy argument.

`article.txt` zawiera tytuł, akapity, listy i adresy linków w zwykłym tekście UTF-8. Tabele stają się wierszami tekstu. Wklej tekst do edytora artykułu i zastąp każdy znacznik `[Diagram 1]`, `[Diagram 2]` itd. odpowiadającym mu plikiem `diagram-1.png`, `diagram-2.png` itd. PNG są eksportowane w kolejności wystąpienia diagramów Mermaid i mają przezroczyste tło.

Diagramy artykułu w PNG korzystają z palety bazowej [astro.json](astro.json), wspólnej z SVG na stronie Field Notes.

## Field Notes w Astro

Zapisz tekst, frontmatter Astro i wszystkie bloki `mermaid` w jednym pliku `content/field-notes/<slug>/index.mmd.md`. Podczas `npm run dev` zapis pliku automatycznie uruchamia eksport i odświeża podgląd Astro. Możesz też uruchomić eksporter ręcznie z katalogu głównego repozytorium.

```bash
bash .agents/skills/linkedin-mermaid/scripts/export.sh --astro \
  content/field-notes/governing-ai-agents-through-purpose-bound-access/index.mmd.md \
  src/pages/field-notes/governing-ai-agents-through-purpose-bound-access/index.md
```

Tryb `--astro` używa [astro.json](astro.json). Generuje `index.md` z odnośnikami do obrazów i zapisuje SVG w podkatalogu `diagrams/`. Utrzymuj w repozytorium źródło oraz wygenerowane pliki. Astro buduje stronę z gotowych plików, więc Mermaid CLI jest potrzebny podczas eksportu.

Jeśli Mermaid CLI potrzebuje własnej konfiguracji Chromium, ustaw `MERMAID_PUPPETEER_CONFIG` na ścieżkę do pliku JSON Puppeteera.
