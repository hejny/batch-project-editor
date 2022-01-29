cd ../../townsgame/

for d in */ ; do
    echo "$d";
    cd $d;

    git filter-branch --force --env-filter '
        WRONG_EMAIL="ph@towns.cz"
        NEW_NAME="Pavol Hejný"
        NEW_EMAIL="me@pavolhejny.com"

        if [ "$GIT_COMMITTER_EMAIL" = "$WRONG_EMAIL" ]
        then
            export GIT_COMMITTER_NAME="$NEW_NAME"
            export GIT_COMMITTER_EMAIL="$NEW_EMAIL"
        fi
        if [ "$GIT_AUTHOR_EMAIL" = "$WRONG_EMAIL" ]
        then
            export GIT_AUTHOR_NAME="$NEW_NAME"
            export GIT_AUTHOR_EMAIL="$NEW_EMAIL"
        fi
    ' --tag-name-filter cat -- --branches --tags;

    git push --force;
    cd ..;
done