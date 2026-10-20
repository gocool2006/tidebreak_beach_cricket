# Beach Cricket 3D — Project Description

## Project overview

Beach Cricket 3D is an Expo and React Native cricket game prototype for Android phones. Menus use portrait orientation; the match rotates to landscape and shows a full-screen Three.js stadium rendered through Expo GL. During live play, players use touch controls for batting timing, shot and footwork selection, bowling aim, swing, pace and release timing.

The scene includes stylized procedural players, a cricket pitch, wickets, fielders, stadium stands, crowd, roof structures, floodlights and animated ball movement. Player actions are code-driven approximations; this prototype does not use motion capture or photorealistic player assets.

## Match flow

- Choose two teams, a venue, difficulty and a format of 5, 10, 20, 30 or 50 overs. Call the toss, choose to bat or bowl if you win, and review either fictional XI before entering the stadium.
- In the first innings, the selected team bats against the opponent's automated bowling. Tap the left timing area to play as the ball enters the green sweet spot. Select a stroke style and footwork on the right: Loft, Push or Stroke; Back Foot, Leave, Special or Front Foot.
- The first innings sets the target. The second innings switches roles: the opponent bats against the user's bowling.
- In the bowling innings, drag the left circular pitch map to set line and length. Choose Straight, In or Away swing on the right to start the release phase. Adjust pace, then tap **OK · Release** before the meter reaches its red section.
- Releasing in the red zone, or allowing the phase to expire, awards the batting team a one-run no-ball without using a legal ball. Legal deliveries advance the over.
- The chase finishes when the target is reached, ten wickets fall or the over limit is reached. The user can also end an innings early.

## Implemented features

- **Full-screen landscape match:** the match rotates to landscape and fills the display with a 3D stadium. A field minimap and match status sit above the play area; a compact scoreboard runs along the bottom.
- **Pre-match flow:** a heads-or-tails toss, a batting/bowling decision, and switchable team lineup cards lead into the match.
- **Batting controls:** left timing pad with early, sweet and late zones; right-side shot-style and footwork selections; leave-alone option.
- **Bowling controls:** draggable pitch target with a visual marker, swing selection, adjustable pace, phase meter, release action and red no-ball zone.
- **Match scoring:** runs, wickets, legal-ball count, overs, target chase, innings break, no-balls and match result.
- **3D stadium:** pitch, oval field, boundary, spectator stands, procedural crowd, roof supports, floodlights, wickets, batter, bowler and fielders.
- **Procedural action animation:** bowler run-up and delivery, batter swing, ball flight, fielder pursuit and wicket response.
- **Menus and settings:** team and venue selection, difficulty, fictional squad, timing and fielding assists, and match commentary toggle.

## Technology

- Expo SDK 57, React Native 0.86 and TypeScript
- Three.js r162 rendered through Expo GL, retaining WebGL 1 compatibility for devices that expose a WebGL 1 context
- `react-native-svg` for custom vector menu artwork
- Expo Go-compatible Android development workflow

## Scope and limitations

This is a stylized prototype. Player models use basic geometric forms, animations are code-driven, and bowling outcomes, ball trajectories and fielding behavior use simplified logic rather than a full cricket physics simulation. It does not include photorealistic assets, motion capture, licensed likenesses or team marks, audio, spoken commentary, replays, persistence, tournaments or multiplayer. The roster names are fictional, and settings do not persist after the app closes.

## Running the project

On Windows PowerShell, install dependencies with `npm.cmd install`, then start Metro with `npx.cmd expo start`. Scan the QR code with Expo Go on Android. Expo Go includes Expo GL for this project. Creating an installable Android package requires an EAS build or a local Android SDK and Gradle setup.
