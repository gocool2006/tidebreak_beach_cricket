# Tidebreak — Beach Cricket Club

Tidebreak is a self-contained, playable browser prototype for beach-style international cricket. It uses original generated beach-ground artwork with animated ball overlays, an open sand-side mat, coastal crowd, shoreline, and festival stands.

## Run it

The project is plain HTML, CSS, and JavaScript. For stable local saves, open a terminal in this folder and run `py -m http.server 4173` on Windows (or `python3 -m http.server 4173` on macOS/Linux), then visit `http://localhost:4173`. No install or build step is required. Opening `index.html` directly also works in many browsers, but browser storage behavior for `file://` pages varies.

## Local saves

Team choices, both playing XIs, match format, an unfinished toss, stadium, batting input mode, shot-map preset, swipe sensitivity, pro-mode settings, the in-progress match, and the 12 most recent results are stored in this browser’s local storage. Match state autosaves after each delivery. Choose **PAUSE & SAVE** to return to setup without losing the match, then choose **RESUME MATCH**; active matches also reopen automatically after closing and reopening the app. A saved result can be reopened from the setup screen. Nothing is uploaded or synchronized. Keep using the same browser and address (`http://localhost:4173`) to find the same save. Browser storage is controlled by the browser: clearing site data, using a different browser/profile/address, or uninstalling an app/browser that removes its site data can erase it. A static browser game cannot guarantee automatic recovery after its browser-owned storage has been deleted.

## Play

1. Choose two different teams, set both playing XIs, select a stadium, and choose 5, 10, 20, 30, or 50 overs.
2. Meet at the toss: choose heads or tails for your captain. The winning captain chooses to bat or bowl; if the opposition wins, its captain makes the call.
3. Batting: use directional swipes on the pitch (up for Loft, left for Cut, right for Drive, down for Defend), or switch to tap buttons. Time the gesture as the ball arrives; keys `1`–`4` are also available.
4. Bowling: choose pace, swing, or spin; select a yorker, good length, or short ball; then press **BOWL NOW** while the marker crosses the green band.
5. Finish the first innings and play the chase. A match ends at the over limit, 10 wickets, or when the target is reached.

All 15 stadium choices are available from the beginning. Their names identify real international grounds; each is presented as an original beach-festival edition rather than a replica. The stadium selector includes Wankhede Stadium in Mumbai, Eden Gardens in Kolkata, Narendra Modi Stadium, M. A. Chidambaram Stadium, M. Chinnaswamy Stadium, Lord’s, The Oval, the Melbourne Cricket Ground, the Sydney Cricket Ground, Gaddafi Stadium, R. Premadasa Stadium, Newlands, Kensington Oval, Basin Reserve, and Dubai International Stadium.

## Squads and eras

Twenty national teams use the confirmed ICC Men’s T20 World Cup 2026 squad list. The squad manager lets you mix those current-roster players with retired international greats for supported nations. A separate **World Legends** team offers a cross-country all-time player pool. Historical players are clearly marked as legends; they are roster options in this prototype, not claims about current squads.

The 2026 squad snapshot follows the [ICC’s final squad announcement](https://www.icc-cricket.com/tournaments/mens-t20-world-cup-2026/news/final-squads-for-icc-men-s-t20-world-cup-2026-confirmed). Real Cricket’s [Google Play listing](https://play.google.com/store/apps/details?id=com.nautilus.realcricket) was used only as a broad gameplay reference for match setup, international teams, batting controls, and scorecards. Tidebreak does not use Real Cricket’s assets, branding, UI art, or character models.

## Prototype scope

This version includes a captain’s toss, a two-innings batting/bowling loop, touch swipes, tap controls, pro-mode timing, shot-map presets, swipe sensitivity, wickets and run scoring, a chase target, live scorecards, squad selection, venue selection, and all five requested over formats. The main ground uses original 3D-style artwork with animated ball overlays; it is still a single-camera browser scene, not a full 3D player-animation engine. There is no online multiplayer, commentary audio, or field placement editor yet.
