# discourse-category-mod-enhancer

This plugin is meant to allow Discourse Category Moderators to access advanced content management tools

## Requirements

This plugin will be kept up to date only with non `-beta` tags.
Currently the latest non beta is [v3.2.1](https://github.com/discourse/discourse/commits/v3.2.1)

If you are on a `beta` tag you can change your `/containers/app.yml` file on the lines:

```
## Which Git revision should this container use? (default: tests-passed)
#version: tests-passed
```

And change it to the tags that match the one supported, so, for example:

```
## Which Git revision should this container use? (default: tests-passed)
version: v3.2.1
```

## More info

Check on [meta.discourse.com](https://meta.discourse.org/t/category-mod-enhancer/268065)

## To contribute

- Download a [development version of discourse](https://meta.discourse.org/t/install-discourse-for-development-using-docker/102009/90) and have it run in your local machine
- Fork this repo in your local plugin folder
- After the work is done, open a merge request
- Wait for feedback/approval
- ???
- Profit


