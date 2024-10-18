# spoticount
Get play counts of songs and artists from Spotify streaming history.

## Getting Spotify data:
- Request extended streaming history data from Spotify: https://www.spotify.com/us/account/privacy/
- This can take up to 30 days and they will email you with a download link once ready

## Preparing the Spotify data:
- Once downloaded, locate the audio history JSON file(s) (named Streaming_History_Audio_* or endsong_*)
- If there are multiple files, combine them into a single file by copying their list elements into a single list
- Rename the file to spotify_history.json and put it in the same directory as this script

##Script usage:
- Run script with: node spoticount.js
- Files will be created in the same directory
- Edit the sript directly to make any changes.
  (e.g. Choose which files are created by commenting file creation calls at the bottom of this sccript)
