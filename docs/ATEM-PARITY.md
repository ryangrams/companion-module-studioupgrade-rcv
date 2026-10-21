# RCV control fork: parity audit

Audited 2026-10-20 against local Companion-ATEM-Fork at 25f5657 and RØDE upstream 1.8.0. This is a source audit. No commands were sent to the production Companion instance or switcher during this work.

## What to bring over

| Experience in the ATEM fork | ATEM source | RCV foundation | Next implementation |
| --- | --- | --- | --- |
| Typed control API, automation and MCP access | src/api/index.ts, verbs.ts, dispatch.ts | Existing action callbacks and length-prefixed TCP OSC codec | Shared command contract with an RCV adapter. Validate inputs, require connection, expose command IDs and deadlines. |
| Confirmed command outcomes | src/api/stateConfirmation.ts | OSC status replies in src/events/recievedDataHandler.ts | Distinguish sent, confirmed, timed out and unsupported. A socket write alone cannot confirm a camera cut. |
| Producer screen and confidence display | src/api/producerScreen.ts, producerPage.ts | Program/preview, names, recording and audio variables | Reuse presentation after adapting the snapshot schema. Add private segment and talent cues. |
| One shared production countdown | src/countdown.ts, actions/countdown.ts | Host-side logic independent of switcher | Port the monotonic timer, cue marks, variables and feedback. |
| Latched recording alarms and after-take reports | src/recordingHealth.ts | Storage variables, record state and timecode | Map measured RCV state. Accept verified offload reports. Keep unknown states visible. |
| Live audio meter distribution | src/api/meters.ts, events.ts | src/helpers/metersHelper.ts and meter feedback | Add subscriber leases and bounded update rate. Preserve peak/RMS semantics and timestamps. |
| Still upload and media ownership | src/api/upload.ts, stillOwnership.ts | Existing media/overlay selection | Verify the RCV transfer protocol before implementing uploads. ATEM transfer packets do not apply. |
| Precise encoder bitrate | src/actions/streaming.ts | No bitrate-set action in RCV upstream commands | Trace the RCV settings and verify read-back before adding controls. ATEM kbps rules do not establish RCV behavior. |
| Animated DVE and SuperSource | src/transitions.ts and src/actions/supersource.ts | RCV scenes, banks and transitions | Discover mutable scene geometry and rate limits first. Preserve RCV's scene model. |
| Macros and sequences | src/actions/macro.ts | Companion action sequences | Host-owned sequences with cancel, hold and recovery. Device macro parity is unproven. |

## Upstream already covers useful controls

RCV upstream includes inputs, scenes, media and overlay control, audio level/gain/mute, submix fades, delay, transition type/time, routing, keying and auto switching. Its feedbacks include program/preview state, recorder/streamer state, meters, storage and wireless mic status. The fork should preserve these.

## Hidden screenshot prototype

The experimental action requests `/actionMenuGrab` or `/actionMultiviewGrab` with one bounded string. It is disabled by default. A saved action checks the gate again when executed. Traversal, paths, empty values and oversized names are rejected.

Instruction evidence in production 1549:

- The dispatcher at 0x2fe498 and 0x2fe500 reads argument zero through string helper 0x5c7dec.
- Menu handler 0x2f70f0 and multiview handler 0x2fbe04 obtain images, combine a base directory, `ScreenGrabs` and the supplied string, and call common writer 0x2f6f50.
- The writer references `.png` at 0x8c55d0. Root verified live menu and multiview captures with string `su_probe_20261020`, producing `/home/weston/Documents/Rode/RCV/RcvShows/ScreenGrabs/su_probe_20261020.png`. Menu PNG is 237×317 (logical display 240×320) and multiview PNG is 1920×1080. Both were visually inspected. No unsolicited file response arrived within two seconds. The coordinator also verified separate OSC/SSH retrieval and remote screenshot cleanup in rode-usb-protocol/prototypes/coordination/capture_screen.py. Retrieval is not yet integrated into this module.

`experimental_grab_status=sent_capture_unconfirmed` records transport completion only. The module does not claim that an image exists, provide a success feedback, retrieve files, embed RTSP credentials, or launch a firmware mode.

## Before loading into a live Companion installation

Keep the upstream instance disabled when testing this fork. The inherited OSC controller and mutable constants are module-global, so concurrent instance isolation needs an audit. Screen grabs can write device storage and should first be tested during a bench session. Root coordinates hardware experiments with the other research agents.

Full autonomous production also needs timestamps shared by transcripts, control events and the recorder. Keep the editorial log independent of Companion button state so Resolve can reconstruct decisions after a connection loss.

## Validation and local build output

TypeScript build passes and the complete Mocha suite passes: 78 tests, including command admission, transport failure handling and truthful submission status. Root exercised the two OSC handlers directly against production firmware. The Companion action itself has not been loaded into a running Companion installation.

The generated `dist/` directory was removed after verification to keep the workstation lean. Restore it with `yarn build`. Installed dependencies remain local for continued development.
