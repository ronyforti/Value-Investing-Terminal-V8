/**
 * Web Audio API synthesized alert chime and HTML5 desktop notification utilities.
 * Zero external audio files required.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Plays an elegant harmonic chime (C5 -> E5 -> G5) using pure sine wave synthesis.
 */
export function playTerminalChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.50 }, // C5
      { freq: 659.25, time: 0.12, dur: 0.55 }, // E5
      { freq: 783.99, time: 0.24, dur: 0.70 }  // G5
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      // Subtle harmonic overtone
      gain.gain.setValueAtTime(0.0001, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.20, now + note.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur + 0.05);
    });
  } catch (err) {
    console.warn("[Audio Chime Warning] Could not play synthesized chime:", err);
  }
}

/**
 * Requests browser permission for HTML5 desktop notifications.
 */
export async function requestDesktopNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    return await Notification.requestPermission();
  }

  return "denied";
}

/**
 * Displays a native desktop notification toast.
 */
export function showDesktopNotification(
  title: string,
  options?: { body?: string; icon?: string; tag?: string; onClick?: () => void }
): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body || "Value Investing Terminal task completed.",
      icon: options?.icon || "/favicon.ico",
      tag: options?.tag || "terminal-alert"
    });

    if (options?.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    return true;
  } catch (err) {
    console.warn("[Desktop Notification Warning]:", err);
    return false;
  }
}

/**
 * Unified helper: Triggers both chime and desktop toast.
 */
export function triggerDesktopAlert(
  title: string,
  body: string,
  playChime: boolean = true
): void {
  if (playChime) {
    playTerminalChime();
  }
  showDesktopNotification(title, { body });
}
