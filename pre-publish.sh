#! /bin/sh

set -eu
set -x

VERSION="$1"

case "$VERSION" in
v*)
    ;;
*)
    VERSION=v"$VERSION"
    ;;
esac

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
RELEASE_BRANCH="release/$VERSION"

if [ ! "$BRANCH" = "$RELEASE_BRANCH" ]
then
    set +x
    echo "It appears you are not in a release branch ($BRANCH is not $RELEASE_BRANCH)"
    exit 1
fi

npm run test
rm -rf lib
npm run build

set +x

echo "Everything seems fine, to publish:"
echo "	npm publish --access public"
echo "	git tag $VERSION"
echo "	git push origin $VERSION"
echo "And then fixup this branch before merge:"
echo "	bump the version in package.json up one and append -dev"
echo "	git push origin $RELEASE_BRANCH"
