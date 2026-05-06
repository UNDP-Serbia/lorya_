## Python Scripts for AI Core


## Anaconda Setup

Install [Miniconda or Anaconda](https://www.anaconda.com/download) for your OS, then create the environment.

**Recommended (all platforms and architectures):** use the cross-platform environment file so the same env works on macOS (x86_64 / arm64), Linux, and Windows:

```bash
conda env create -f environment.cross-platform.yml
```

Then activate the environment:

```bash
conda activate lorya
```

Alternatively, you can use `environment.yml` (export with build strings; may only work on the platform it was exported from) or `environment.linux.yml` (version-only deps; includes a fixed prefix). 