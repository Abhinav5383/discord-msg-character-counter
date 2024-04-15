## A little script to count total characters sent in the message search list on `Discord`

* Open devtool in discord web on desktop and paste the script
* Enter the query in the message finder on discord
* Click the `Sum up letters` button that appeared after pasting the script
* The stats will get logged in the console
* If you are getting rate limited very often, increase the delay between each iteration

* ### If you get rate limited midst of running the script
    - Note the `totalMessages` and `totalCharacters` count from the console, close the tab and open discord in a new tab
    - Paste the script in the console and enter the same search query again
    - Check that your previous stats was saved by doing `document.cookie` in the console,<br> if its empty or the value is '0', then do `document.cookie = '{"totalMessages":0,"totalCharacters":0}'`, replace the `0`s with your actual count
    - Calculate `(totalMessages / 25) + 1` and change the search result page to the value you get
    - Click the run button again

    ### NB : -
    * Don't switch channels while the script is running or you will have to start the script again in a new tab
    * Close the tab if you want to stop the script when it's still running
    * When starting a new count make sure the `document.cookie` does not have any state saved in it, if it has, do `document.cookie = '{"totalMessages":0,"totalCharacters":0}'` to reset that or it will continue adding to that previous stat