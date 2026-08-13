import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('macOS Inline Fix shortcut release architecture', () => {
  const native = readFileSync('src-tauri/src/pro/inline_fix.rs', 'utf8');
  const app = readFileSync('src-tauri/src/lib.rs', 'utf8');

  it('starts on K release without polling physical modifier release', () => {
    expect(app).toContain('ShortcutState::Released');
    expect(native).toContain('INLINE_FIX_K_RELEASED');
    expect(native).not.toContain('CGEventSourceKeyState');
    expect(native).not.toContain('MODIFIER_RELEASE_TIMEOUT');
  });

  it('posts explicit Command-only copy/paste through the annotated session tap', () => {
    expect(native).toContain('CG_ANNOTATED_SESSION_EVENT_TAP');
    expect(native).toContain('synthesize_keystroke(VK_ANSI_C, CG_EVENT_FLAG_COMMAND)');
    expect(native).toContain('synthesize_keystroke(VK_ANSI_V, CG_EVENT_FLAG_COMMAND)');
    expect(native).not.toContain('CG_EVENT_FLAG_ALTERNATE');
  });

  it('preserves the complete clipboard without overwriting concurrent changes', () => {
    expect(native).toContain('snapshot_pasteboard_items()');
    expect(native).toContain('pasteboardItems');
    expect(native).toContain('writeObjects:');
    expect(native).toContain('CLIPBOARD_RESTORE_DELAY: Duration = Duration::from_millis(150)');
    expect(native).toContain('self.expected_change_count == Some(get_pasteboard_change_count())');
    expect(native).toContain('INLINE_FIX_CLIPBOARD_RESTORE_SKIPPED_CHANGED');
  });
});
