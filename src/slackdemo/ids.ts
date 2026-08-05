// Bolt routes on action_id, so these stay fixed while any variable payload
// rides in the action's value / block_id / view private_metadata.
export const ACTION_SPEAKER_SELECT = "zvd:sp"
export const ACTION_STYLE_SELECT = "zvd:ss"
export const ACTION_TTS_ENABLED = "zvd:te"
export const CALLBACK_MODAL = "zvd:modal"

export const ACTION_STYLE_SELECT_PATTERN = /^zvd:ss:/
export function styleActionId(styleId: number): string {
    return `${ACTION_STYLE_SELECT}:${styleId}`
}

export const ACTION_TTS_ENABLED_PATTERN = /^zvd:te:/
export function ttsActionId(enabled: boolean): string {
    return `${ACTION_TTS_ENABLED}:${enabled ? "e" : "d"}`
}
export function isTtsEnableActionId(actionId: string): boolean {
    return actionId.endsWith(":e")
}
