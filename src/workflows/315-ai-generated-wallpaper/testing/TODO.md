## Testing of flags

_Note: [🎏] Usage of flags here_

-   **Version** `--version 1` vs `--version 2` vs `--version 3`
-   **Size** **`--aspect 2:1`** vs `--w 1280 --h 640`
-   **HD** Use `--hd` or not
-   **Upscaler** Use `--uplight` or not
-   **Stylization** `--stylize 625` vs `--stylize 1250` vs `--stylize 20000` vs `--stylize 60000`
    See https://midjourney.gitbook.io/docs/user-manual#stylize-values
-   **Quality** `--quality 0.25` vs `--quality 0.5` vs `--quality 1` vs `--quality 2`
    See https://midjourney.gitbook.io/docs/user-manual#quality-values

Testing on sentence:

```discord
/imagine Playground for miscellaneous startup ideas
```

```discord
Testing best flag for size
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1
/imagine Playground for miscellaneous startup ideas --seed 1 --w 1280 --h 640

Testing best combination of imagine options
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --version 1
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --version 2

/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --version 1 --hd
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --version 2 --hd
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --version 3 --hd
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --version 3 --uplight
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --version 3 --hd --uplight

Testing stylization
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --stylize 625
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --stylize 1250
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --stylize 20000
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --stylize 60000

Testing stylization
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --quality 0.1
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --quality 0.25
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --quality 0.5
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --quality 1
/imagine Playground for miscellaneous startup ideas --seed 1 --aspect 2:1 --quality 2
```

## Seeds

## Testing of flags for icons

-   Test outline of icon shape as `Image prompt`
    See https://midjourney.gitbook.io/docs/imagine-parameters#image-prompting-with-url
