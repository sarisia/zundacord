# Slack Block Kit demo of `/voice`

A UI-only demo showing that Slack's Block Kit can reproduce (and extend)
zundacord's Discord `/voice` command. No VOICEVOX calls, no audio, no Discord
code touched — speaker data is a hardcoded fixture (`fixtures.ts`) and config
is in-memory only (`state.ts`).

`/voice` has two surfaces, both driven by the exact same Block Kit blocks
(`blocks/voice.ts`):

- **`/voice`** — an ephemeral in-channel message, edited in place on every
  click via `respond({ replace_original: true, ... })`. This is the one that
  actually corresponds to the Discord original, which is not a modal at all
  but an ephemeral message updated with `interaction.update()`.
- **`/voice dialog`** — a Slack modal that *live-updates as you interact with
  it*, edited in place via `views.update`, without submitting — something a
  Discord modal cannot do (Discord modals are static until submit). Any
  `command.text` other than `dialog` (including empty) falls through to the
  inline message — there's no error for typos, it's a demo.

Both surfaces list all 31 speakers in a single `static_select` (Slack allows
up to 100 options, well above the fixture size, so no paging is needed).

There is no submit/保存 button on either surface. Every control — the
speaker select, the style buttons, the TTS buttons — persists on click,
matching the Discord original where style selection also saves immediately.
This is possible because none of the blocks are `input` blocks: Slack only
requires a `submit` button when a view contains at least one `input` block.

Inline mode posts no separate confirmation message: the message *is* the
live state, and it already reflects the saved speaker/style/TTS after every
click, so a follow-up "更新しました" would be redundant.

Modal mode still has no way to close itself from a `block_actions` handler
(only user action, or `response_action: "clear"` from a `view_submission` —
which needs the submit button we don't have). So the modal only ever closes
by user action (閉じる, the X, or clicking outside), and that close is
exactly when the confirmation is posted: the modal is registered with
`notify_on_close: true`, and a `view_closed` handler posts the ephemeral
green "更新しました" attachment into the channel via the slash command's
`response_url`, but only if something was actually changed in this session
(tracked via a `dirty` flag in `private_metadata`) — opening `/voice dialog`
and closing it untouched posts nothing. The confirmation is ephemeral
(visible only to the invoking user), matching the Discord original where
voice config is per-user.

`response_url` is valid for about 30 minutes and each one can be used at
most 5 times — but that budget doesn't accumulate the way click count might
suggest. The slash command's own `response_url` is spent exactly once, on
the very first render. Every `block_actions` payload after that (each click)
carries its **own** fresh `response_url` for the interaction that produced
it, which is what both modal-mode's `view_closed` confirmation and inline
mode's every-click re-render use. So inline mode is not capped at 5 clicks —
only the first message send is.

## Setup

1. Create a Slack app from `manifest.yml` (paste its contents at
   <https://api.slack.com/apps> → Create New App → From an app manifest).
2. Install the app to your workspace.
3. Under **Basic Information → App-Level Tokens**, create a token with the
   `connections:write` scope — this is `ZUNDACORD_SLACK_APP_TOKEN` (`xapp-...`).
4. Under **OAuth & Permissions**, copy the **Bot User OAuth Token** — this is
   `ZUNDACORD_SLACK_BOT_TOKEN` (`xoxb-...`).
5. Set both in your `.env` (see `.env.example`). `ZUNDACORD_LANG` and
   `ZUNDACORD_LOG_LEVEL` are reused from the main bot. `.env` in the repo root
   is loaded automatically by `npm run slack-demo` (via `dotenv`); real shell
   env vars take precedence over it.
6. `npm run build && npm run slack-demo`

## Dry-run without a Slack app

`node lib/slackdemo/index.js --dump` prints the inline message, the modal
view, and the post-close confirmation message as pretty JSON, no token
required. Paste any payload into <https://app.slack.com/block-kit-builder>
to preview it (switch the surface selector to Message for `inlineMessage`,
Modal for `modal`).

Note: invoking `node lib/slackdemo/index.js --dump` directly bypasses the
`npm run slack-demo` script, so `.env` is *not* loaded — harmless here since
`--dump` needs no tokens, but pass `ZUNDACORD_LANG` inline if you need it,
e.g. `ZUNDACORD_LANG=en node lib/slackdemo/index.js --dump`.

## Discord → Slack mapping

| Discord | Slack | Note |
|---|---|---|
| Embed color | `attachments[].color` wrapping the blocks | The only way to get the left accent bar |
| Embed title | `header` block (`plain_text`, ≤150 ch) | |
| Field `inline: false` | standalone `section` with `mrkdwn` | |
| Two `inline: true` fields | one `section` with `fields: [...]` | Slack renders 2-up — matches Discord exactly |
| Embed footer | `context` block | `aria-music/zundacord` |
| `StringSelectMenu` option `label`/`description`/`value` | `static_select` option `text`/`description`/`value` | Slack caps `description` at 75 ch (Discord 100) — truncated |
| option `default: true` | `initial_option` | Must match a member of `options` |
| Button `Success`/`Danger`/`Secondary` | `style: "primary"` / `"danger"` / omitted | Slack has no Secondary-vs-Primary distinction |
| `setDisabled(true)` | no equivalent | TTS becomes a primary/danger button pair instead (`button_tts_enable` / `button_tts_disable`) — the current state lives in the section text above the buttons (`renderTtsSection`), since Slack buttons can't show a disabled/selected look |
| `customId` JSON payload (style buttons) | button `value` (style id) | `value` only needs to hold what the payload doesn't already have; `selectedUuid` is derived from the style id, not carried |
| One `customId` per button, no uniqueness constraint | `action_id` must be unique within its block | Slack rejects (`invalid_blocks`) an `actions` block whose buttons share an `action_id` — each style button gets `zvd:ss:<styleId>` (`ACTION_STYLE_SELECT_PATTERN`), each TTS button gets `zvd:te:e`/`zvd:te:d` (`ACTION_TTS_ENABLED_PATTERN`) |
| Style buttons capped at 2 rows × 5 = 10, extra styles silently dropped | All styles rendered, no cap | Slack allows 25 elements/`actions` block and 100 blocks/view; `Voidoll`'s 11th and 12th styles (`感情なし`, `元気`) are reachable here but unreachable in Discord |
| 5 buttons per `ActionRowBuilder` row (`ActionRowBuilder` hard-caps a row at 5) | 25 buttons per `actions` block | Discord's 5-per-row split is a UI artifact of `ActionRowBuilder`, not a real constraint here — Slack's actual cap is 25 elements/block and it wraps buttons across lines on its own, so styles are chunked only as a guard against exceeding 25, not to mimic Discord's rows |
| `customId` JSON payload (speaker select) | view `private_metadata` | Modal only: carries `responseUrl` and `dirty` across `views.update` round-trips. The browsed speaker isn't in there — the select payload already names it |
| `customId` field `p` (character page), carried because nothing else in the payload identifies it | TTS button `value` = the browsed speaker's uuid | Same reason: the TTS button's payload otherwise has no way to say which speaker's style buttons/ToS should stay on screen. `action_id` already encodes enable/disable (`zvd:te:e`/`zvd:te:d`), so `value` is free for this instead of being redundant with it |
| `interaction.update()` | `client.views.update()` (modal) **or** `respond({ replace_original: true })` (inline message) | Both live-update their surface in place; which one runs is decided by `body.view` being present |
| Modal: static until submit | `views.update` from any `block_actions` handler, no submit involved | Slack-only capability |
| n/a | modal with an `input` block requires a `submit` button | Why every input became a `section`/`accessory` or `actions` element instead — the only way to drop the Save button entirely |
| n/a | `notify_on_close: true` + `view_closed` handler | Modal only. There's no way to close a modal programmatically from `block_actions`, so the confirmation can't fire on the triggering click — it fires once, on user-initiated close, and only if a `dirty` flag in `private_metadata` shows something changed. The inline message needs none of this: it re-renders in place on every click, so it already shows the current state with no separate confirmation |

## Files

- `index.ts` — entrypoint, env handling, `--dump`.
- `app.ts` — `SlackVoiceDemo`, all Bolt handler registrations.
- `blocks/voice.ts` — shared block builders used by both the modal and the inline message.
- `blocks/message.ts` — attachment/message renderers (inline message, confirmation, ToS, error).
- `blocks/modal.ts` — modal view envelope.
- `fixtures.ts` — hardcoded VOICEVOX speaker data + accessors.
- `state.ts` — in-memory per-user config store.
- `ids.ts` — action id / callback id constants.
