const pad = (n: number) => String(n).padStart(2, "0");

function toLocalInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO da API (UTC) → "YYYY-MM-DDTHH:mm" no fuso local, para inputs datetime-local. */
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? localNow() : toLocalInput(d);
}

/** "YYYY-MM-DDTHH:mm" do input datetime-local (fuso local) → ISO UTC para a API. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

export function localNow(): string {
  return toLocalInput(new Date());
}

export function formatCreatedAtLocal(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Segundos → duração curta legível: "45s", "12min", "3h 20min", "2d 4h".
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const rem = mins % 60;
    return rem ? `${hours}h ${rem}min` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem ? `${days}d ${rem}h` : `${days}d`;
}
