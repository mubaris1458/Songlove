# Original build specification

---



Build a Music Streaming Web App (Spotify/JioSaavn Style)



Create a modern, fast, responsive music streaming web application.



Data Source



Use my Google Drive folder as the music source.



Google Drive Folder: https://drive.google.com/drive/folders/1r5KIh7S3p7DUIxpy6nPS8lwGyD0Ar0sE



I already have metadata (ZIP file) containing:



Movie Name



Hero/Actor



Song Name



Singer



Music Director



Year



Album Art (if available)





Use the ZIP metadata to organize the songs automatically.



Do NOT create duplicate songs.





---



Home Page



Do NOT show all songs first.



Instead show:



Recently Added



Trending Movies



Popular Actors



Latest Albums



A-Z Movie List





The main browsing method should be Movie → Songs.





---



Movie Page



Example:



Thug Life (2025)



Poster



Hero: Kamal Haasan



Music: A.R. Rahman



Songs:



Jinguchaa



Sugar Baby



... (All 10 songs)





Play All button



Shuffle button



Download Album button



Favorite button



Share button





---



Actor Page



Example:



Kamal Haasan



Movies:



Thug Life



Indian 2



Vishwaroopam



Vishwaroopam 2



Vikram



Dasavathaaram



etc.





Clicking a movie opens its song list.





---



Search



The search must search everything.



Search by



Movie Name



Song Name



Actor Name



Singer Name



Music Director



Album Name



Year



Example:



Search "Kamal"



Show



Thug Life



Indian 2



Vishwaroopam



Vikram



etc.



Search "A.R. Rahman"



Show every song composed by A.R. Rahman.



Search "Shreya Ghoshal"



Show every song by that singer.





---



Music Player



Spotify/JioSaavn style player.



Features:



Play



Pause



Next



Previous



Repeat



Shuffle



Seek Bar



Current Time



Duration



Queue



Auto Play Next Song



Mini Player



Background Playback



Lock Screen Media Controls



Keyboard Media Controls





---



Download



Every song should have



Download button



Album Download button



Downloads should work on mobile.





---



Favorites



Users can



Like songs



Like albums



Like movies



Like artists





---



Playlist



Create Playlist



Edit Playlist



Delete Playlist



Play Playlist



Shuffle Playlist





---



UI



Dark Theme



Beautiful animations



Rounded cards



Large movie posters



Responsive for mobile



Fast loading



Lazy loading





---



Organization



Automatically organize songs like:



Actor



└── Movie



└── Songs



Example:



Kamal Haasan



├── Thug Life │ ├── Song 1 │ ├── Song 2 │ └── Song 10



├── Indian 2 │ ├── Song 1 │ └── Song 5



├── Vishwaroopam



├── Vishwaroopam 2





---



Admin



Admin can



Add songs



Delete songs



Edit metadata



Upload movie poster



Upload album art



Edit actor



Edit singer



Edit music director





---



Performance



Fast search



Instant filtering



Caching



Optimized loading





---



Important



No advertisements.



Free to use.



Mobile-first design.



Similar experience to Spotify and JioSaavn.



Organize all songs automatically using the ZIP metadata.



Never show duplicate songs.



Every movie must display all its songs together.



Search must work for Movies, Songs, Actors, Singers, Music Directors, Albums, and Years.



Include a Download button for every song and album.



Build this as a complete online music streaming web application with a professional UI.

