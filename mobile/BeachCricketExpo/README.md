# Beach Cricket 3D — Expo Prototype

A playable mobile cricket prototype built with Expo, React Native, Three.js and TypeScript. Menus stay portrait; matches rotate into landscape for a full-screen 3D stadium, with touch controls and a broadcast-style score strip.

## Run on an Android phone

Requirements: Node.js 22.13 or later and npm. In Windows PowerShell, open this project folder and run:

```powershell
npm.cmd install
npx.cmd expo start --clear --lan --port 8083 --go
```

Keep the terminal open. Connect the Android phone and computer to the same Wi-Fi, open Expo Go, choose **Scan QR code**, and scan the QR displayed by Expo. If the QR is hidden, press `E` in the Expo terminal to show it. The `.cmd` suffix avoids the PowerShell execution-policy error from `npx.ps1`. Port `8083` avoids the project's usual occupied-port prompt. After editing the app, press `r` in the Expo terminal to reload it; use `npx.cmd expo start --clear --lan --port 8083 --go` again if Metro needs a clean restart.

The 3D scene uses Expo GL, which is included in the Expo Go runtime for this SDK. If the phone cannot reach the LAN URL, confirm both devices are on the same non-guest Wi-Fi network and allow Node.js through the Windows private-network firewall prompt.

## Play

1. Start from the Arena Hub. Choose **Quick Match**, **Format Tour**, **Super Over**, or **Shot Lab**. Format Tour lets you select teams, venue, difficulty and overs. Call heads or tails, choose to bat or bowl if you win the toss, and review either lineup. Presentation and match play run in landscape.
2. **When your side bats:** tap **Next Ball** on the left to start a delivery. Choose Loft, Push or Stroke and a footwork option on the right. Tap the left timing area as the ball reaches the green sweet spot. Leave lets the ball pass without attempting a shot.
3. **When your side bowls:** drag the marker in the left pitch map to choose the ball's line and length. On the right, choose a bowling variation; this starts the phase meter. Adjust pace, then tap **OK · Release** before the red zone. Releasing in the red zone, or letting the phase expire, gives the batting side a no-ball and one run without using a legal delivery. Tap the field radar to edit the live fielding preset.
4. The match ends when the chase target is reached, ten wickets fall, or the selected overs are used. The **End** button can end an innings early.

Available formats are 5, 10, 20, 30 and 50 overs.

## Included

- Match setup, coin toss, batting/bowling decision, lineup cards, two-innings scoring, target chase, overs, wickets and result screen.
- Full-screen landscape match with a real-time Three.js scene rendered through Expo GL.
- One raised end-on broadcast camera behind the bowler, shared by batting and bowling, with the batter, keeper and full pitch in view.
- Original procedural stadium, textured grass and pitch, boundary, stands, crowd, roof supports, floodlights, wickets, batter, bowler and fielders.
- Timing-based batting, selectable stroke and footwork, target placement, swing direction, pace and phase-based bowling.
- A red no-ball release zone and no-ball score handling.
- Bowler run-up before each delivery, plus procedural batting, bowling, ball-flight, fielder-chase and wicket animations.
- Fictional squad screen, local gameplay settings and custom vector menu artwork.

## Prototype scope

This is a stylized playable prototype, not a photorealistic or motion-captured cricket simulator. Player models use simple procedural geometry; ball paths, fielding reactions and outcomes are simplified. It does not include scanned players, licensed uniforms or logos, advanced physics, audio, recorded commentary, replays, saves, tournaments or multiplayer. Settings are session-local. The visual presentation uses original teams and styling.

This project uses Expo SDK 57 and Three.js r162 to support the WebGL 1 context reported by this Expo GL device. The 3D view runs in Expo Go on Android. An installable Android package requires an Android build through EAS or a local Android development setup.
