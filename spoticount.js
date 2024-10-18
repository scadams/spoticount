/*
Get play counts of songs and artists from Spotify streaming history.

Getting Spotify data:
- Request extended streaming history data from Spotify: https://www.spotify.com/us/account/privacy/
- This can take up to 30 days and they will email you with a download link once ready

Preparing the Spotify data:
- Once downloaded, locate the audio history JSON file(s) (named Streaming_History_Audio_* or endsong_*)
- If there are multiple files, combine them into a single file by copying their list elements into a single list
- Rename the file to spotify_history.json and put it in the same directory as this script

Script usage:
- Run script by typing: node spoticount.js
- Files will be created in the same directory
- Edit the sript directly to make any changes.
  (e.g. Choose which files are created by commenting file creation calls at the bottom of this sccript)
*/


let fs = require('fs');

// Load Spotify streaming history and sort by timestamp (desc)
let songHistory = require('./spotify_history.json');
songHistory.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());


// map unique songs to play counts
let songMap = {};
songHistory.forEach(song => {
  let songId = song['spotify_track_uri'];

  if (songId == null) { return; }

  if (!(songId in songMap)) {
    songMap[songId] = {
      artist: song['master_metadata_album_artist_name'],
      album: song['master_metadata_album_album_name'],
      track: song['master_metadata_track_name'],
      spotify_track_uri: songId,
      song_playcount: 1
    };
  } else {
    songMap[songId].song_playcount += 1;
  }
});

// sort songs first by play count (desc), then artist and track (asc)
let songPlayCounts = Object.values(songMap);
songPlayCounts.sort((a, b) => b.song_playcount - a.song_playcount || a.artist.localeCompare(b.artist) || a.track.localeCompare(b.track));


// group songs by artist and map artists to total play counts
let artistMap = {};
songPlayCounts.forEach(song => {
  if (!(song.artist in artistMap)) {
    artistMap[song.artist] = {
      artist: song.artist,
      artist_playcount: song.song_playcount,
      songs: [song]
    };
  } else {
    artistMap[song.artist].artist_playcount += song.song_playcount,
    artistMap[song.artist].songs.push(song);
  }
});

// sort artists by total play counts (desc)
let artistSongsPlayCounts = Object.values(artistMap);
artistSongsPlayCounts.sort((a, b) => b.artist_playcount - a.artist_playcount);

// convert list of songs to the number of songs
let artistPlayCounts = artistSongsPlayCounts.map(({artist, artist_playcount, songs}) => ({artist, artist_playcount, num_songs: songs.length}));

// group songs by artist, first sorted by artist play count (desc) then song play count (desc)
let artistSongsPlayCountsFlat = [];
artistSongsPlayCounts.forEach(artist => {
  artist.songs.forEach(song => {
    song.artist_playcount = artist.artist_playcount;
    artistSongsPlayCountsFlat.push(song);
  });
});


function writeJSON(filename, data) {
  fs.writeFile(filename, JSON.stringify(data), err => { if (err) { console.error(err); } });
}

function writeCSV(filename, data) {
  let csvData = [];
  csvData.push(Object.keys(data[0]));
  data.forEach(item => {
    csvData.push(Object.values(item));
  });

  let csvStr = csvData.map(row =>
    row
      .map(String)
      .map(v => v.replaceAll('"', '""'))
      .map(v => `"${v}"`)
      .join(',')
  ).join('\r\n');

  fs.writeFile(filename, csvStr, err => { if (err) { console.error(err); } });
}


// Create file with streaming history sorted by timestamp (desc)
writeJSON(`spotify_history_sorted.json`, songHistory);


// Create file with simplified streaming history
songHistory.map(({}) => {})


// Create JSON files
writeJSON('spotify_playcount_songs.json', songPlayCounts);
writeJSON('spotify_playcount_artists.json', artistPlayCounts);
writeJSON('spotify_playcount_artists_songs.json', artistSongsPlayCounts);
//writeJSON('spotify_playcount_artists_songs_flat.json', artistSongsPlayCountsFlat);

// Create CSV files
writeCSV('spotify_playcount_songs.csv', songPlayCounts);
writeCSV('spotify_playcount_artists.csv', artistPlayCounts);
writeCSV('spotify_playcount_artists_songs.csv', artistSongsPlayCountsFlat);
