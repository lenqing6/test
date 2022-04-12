strmid=$(git rev-parse HEAD)
strmmsg=$(git log --pretty=format:"%s" $strmid -1)
strPOEditor="Update.*\(POEditor.com\)"
if [[ $strmmsg =~ $strPOEditor ]]
then
	  git fetch origin
	    strwk=$(for branch in `git branch -r | grep -v HEAD | grep '[0-9]*.wk[0-9]*$'`;do echo -e `git show --format="%ci %cr" $branch | head -n 1` \\t$branch; done | sort -r | head -1)
	      strwk=${strwk#*/}
	        git checkout $strwk
		  git cherry-pick $strmid
		     git add .
		    	git commit -m "Update translation.json (POEditor.com)" 
		  	  git push
		      	    git checkout main
	      else
		        echo "非POEditor代码提交"
		fi

