# Releasing

```
git flow release start 1.2.3

# add new version to changelog
vi CHANGELOG.md

# increase version number
vi package.json

git commit -am 'release 1.2.3'

git flow release finish 1.2.3

git push --follow-tags
```
