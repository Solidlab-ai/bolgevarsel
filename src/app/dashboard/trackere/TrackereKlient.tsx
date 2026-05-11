'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'

type Device = {
  imei: string
  name: string | null
  model: string | null
  customer_id: string | null
  last_seen_at: string | null
  last_status: string | null
  last_voltage: number | null
  last_latitude: number | null
  last_longitude: number | null
  last_position_at: string | null
  notes: string | null
  created_at: string
}

type TrackerEvent = {
  id: number
  imei: string
  status: string
  status_type: string
  is_critical: boolean
  backup_voltage: number | null
  latitude: number | null
  longitude: number | null
  speed_kmh: number | null
  gps_valid: boolean
  cell_info: any
  received_at: string
}

type TrackerCommand = {
  id: number
  imei: string
  command: string
  command_type: string
  status: 'pending' | 'sent' | 'acknowledged' | 'failed' | 'timeout' | 'cancelled'
  response: string | null
  payload: { description?: string } | null
  created_at: string
  sent_at: string | null
  acknowledged_at: string | null
}

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  auto: { label: 'Normal', color: '#22c55e', emoji: '📍' },
  shake: { label: 'Bevegelse', color: '#f59e0b', emoji: '🏃' },
  towed: { label: 'I bevegelse', color: '#f59e0b', emoji: '🚶' },
  still: { label: 'Stillstand', color: '#6b8fa3', emoji: '⏸️' },
  sos: { label: 'SOS-ALARM', color: '#dc2626', emoji: '🆘' },
  blp: { label: 'Lavt batteri', color: '#dc2626', emoji: '🔋' },
  plug: { label: 'Lader', color: '#22c55e', emoji: '🔌' },
  unplug: { label: 'Lader frakoblet', color: '#6b8fa3', emoji: '⚡' },
  full: { label: 'Fulladet', color: '#22c55e', emoji: '✅' },
  call: { label: 'Heartbeat', color: '#6b8fa3', emoji: '💓' },
  ht: { label: 'Våkner opp', color: '#0a2a3d', emoji: '☀️' },
  indoor: { label: 'Hjemme', color: '#22c55e', emoji: '🏠' },
  outdoor: { label: 'Ute', color: '#f59e0b', emoji: '🌊' },
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'aldri'
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s siden`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min siden`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}t siden`
  const days = Math.floor(hr / 24)
  return `${days}d siden`
}

function voltagePercent(v: number | null): number {
  if (v === null) return 0
  // 3.0V = 0%, 4.2V = 100% (typisk Li-ion)
  const pct = ((v - 3.0) / (4.2 - 3.0)) * 100
  return Math.max(0, Math.min(100, Math.round(pct)))
}

function voltageColor(v: number | null): string {
  const pct = voltagePercent(v)
  if (pct < 20) return '#dc2626'
  if (pct < 40) return '#f59e0b'
  return '#22c55e'
}

export default function TrackereKlient({
  devices,
  events,
}: {
  devices: Device[]
  events: TrackerEvent[]
}) {
  const [selectedImei, setSelectedImei] = useState<string | null>(
    devices[0]?.imei ?? null
  )

  const selectedDevice = useMemo(
    () => devices.find((d) => d.imei === selectedImei) ?? null,
    [devices, selectedImei]
  )

  const deviceEvents = useMemo(
    () => events.filter((e) => e.imei === selectedImei).slice(0, 50),
    [events, selectedImei]
  )

  const criticalCount = useMemo(
    () => events.filter((e) => e.is_critical).length,
    [events]
  )

  // Command queue state
  const [commands, setCommands] = useState<TrackerCommand[]>([])
  const [sendingCommand, setSendingCommand] = useState<string | null>(null)

  const fetchCommands = useCallback(async () => {
    if (!selectedImei) return
    try {
      const res = await fetch(`/api/devices/${selectedImei}/command`)
      if (res.ok) {
        const data = await res.json()
        setCommands(data.commands ?? [])
      }
    } catch (err) {
      console.error('Klarte ikke å hente kommandoer:', err)
    }
  }, [selectedImei])

  // Hent kommando-historikk når enhet velges + poll hver 3 sek
  useEffect(() => {
    fetchCommands()
    const interval = setInterval(fetchCommands, 3000)
    return () => clearInterval(interval)
  }, [fetchCommands])

  const sendCommand = useCallback(
    async (command: string) => {
      if (!selectedImei || sendingCommand) return
      setSendingCommand(command)
      try {
        const res = await fetch(`/api/devices/${selectedImei}/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command }),
        })
        if (!res.ok) {
          const err = await res.json()
          alert(`Feil: ${err.error || 'Ukjent feil'}`)
        } else {
          fetchCommands()
        }
      } catch (err) {
        alert(`Klarte ikke å sende kommando: ${err}`)
      } finally {
        setTimeout(() => setSendingCommand(null), 800)
      }
    },
    [selectedImei, sendingCommand, fetchCommands]
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0f7fa 0%, #e6f0f5 100%)',
      padding: '40px 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#0a2a3d',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 13,
            color: '#6b8fa3',
            fontWeight: 600,
            letterSpacing: 0.5,
            marginBottom: 4,
          }}>
            BØLGEVARSEL KYST
          </div>
          <h1 style={{
            fontSize: 36,
            fontWeight: 700,
            margin: 0,
            color: '#0a2a3d',
          }}>
            Mine GPS-trackere
          </h1>
          <p style={{
            fontSize: 15,
            color: '#6b8fa3',
            marginTop: 8,
            marginBottom: 0,
          }}>
            {devices.length} {devices.length === 1 ? 'enhet' : 'enheter'} registrert
            {criticalCount > 0 && (
              <>
                {' · '}
                <span style={{ color: '#dc2626', fontWeight: 600 }}>
                  {criticalCount} kritisk{criticalCount === 1 ? '' : 'e'} hendels{criticalCount === 1 ? 'e' : 'er'}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Empty state */}
        {devices.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 48,
            textAlign: 'center',
            border: '1px solid rgba(10,42,61,0.08)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
            <h2 style={{ fontSize: 22, margin: 0, marginBottom: 8 }}>
              Ingen trackere registrert
            </h2>
            <p style={{ color: '#6b8fa3', marginTop: 0 }}>
              Når en MT710 GPS-tracker kobler seg til serveren vil den dukke opp her.
            </p>
          </div>
        )}

        {/* Layout: device-liste til venstre + detaljer til høyre */}
        {devices.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 24,
            alignItems: 'start',
          }}>
            {/* Devices list */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              {devices.map((d) => {
                const isSelected = d.imei === selectedImei
                const statusInfo = d.last_status ? STATUS_LABELS[d.last_status] : null
                const online = d.last_seen_at
                  ? Date.now() - new Date(d.last_seen_at).getTime() < 30 * 60 * 1000
                  : false

                return (
                  <button
                    key={d.imei}
                    onClick={() => setSelectedImei(d.imei)}
                    style={{
                      background: isSelected ? '#0a2a3d' : 'white',
                      color: isSelected ? 'white' : '#0a2a3d',
                      border: '1px solid ' + (isSelected ? '#0a2a3d' : 'rgba(10,42,61,0.08)'),
                      borderRadius: 14,
                      padding: '16px 18px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                    }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        background: online ? '#22c55e' : '#9ca3af',
                      }} />
                      <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                      {d.name || d.imei}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.6, fontFamily: 'monospace' }}>
                      {d.imei}
                    </div>
                    {statusInfo && (
                      <div style={{
                        marginTop: 8,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <span>{statusInfo.emoji}</span>
                        <span>{statusInfo.label}</span>
                        <span style={{ opacity: 0.6, marginLeft: 'auto' }}>
                          {timeAgo(d.last_seen_at)}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Detail panel */}
            {selectedDevice && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}>
                {/* Status-kort */}
                <div style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid rgba(10,42,61,0.08)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 20,
                  }}>
                    <div>
                      <h2 style={{
                        fontSize: 22,
                        margin: 0,
                        marginBottom: 4,
                      }}>
                        {selectedDevice.name}
                      </h2>
                      <div style={{
                        fontSize: 13,
                        color: '#6b8fa3',
                        fontFamily: 'monospace',
                      }}>
                        IMEI {selectedDevice.imei} · {selectedDevice.model}
                      </div>
                    </div>
                    {selectedDevice.last_status && STATUS_LABELS[selectedDevice.last_status] && (
                      <div style={{
                        background: STATUS_LABELS[selectedDevice.last_status].color + '15',
                        color: STATUS_LABELS[selectedDevice.last_status].color,
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                      }}>
                        {STATUS_LABELS[selectedDevice.last_status].emoji}{' '}
                        {STATUS_LABELS[selectedDevice.last_status].label}
                      </div>
                    )}
                  </div>

                  {/* Stats-grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 16,
                  }}>
                    <Stat
                      label="Batteri"
                      value={selectedDevice.last_voltage
                        ? `${voltagePercent(selectedDevice.last_voltage)}%`
                        : '—'}
                      sublabel={selectedDevice.last_voltage
                        ? `${selectedDevice.last_voltage.toFixed(3)}V`
                        : 'Ingen data'}
                      color={voltageColor(selectedDevice.last_voltage)}
                    />
                    <Stat
                      label="Siste kontakt"
                      value={timeAgo(selectedDevice.last_seen_at)}
                      sublabel={selectedDevice.last_seen_at
                        ? new Date(selectedDevice.last_seen_at).toLocaleString('nb-NO')
                        : '—'}
                    />
                    <Stat
                      label="Posisjon"
                      value={selectedDevice.last_latitude && selectedDevice.last_longitude
                        ? `${selectedDevice.last_latitude.toFixed(4)}°N`
                        : '—'}
                      sublabel={selectedDevice.last_longitude
                        ? `${selectedDevice.last_longitude.toFixed(4)}°E`
                        : 'Ingen GPS-fix'}
                    />
                    <Stat
                      label="Kunde"
                      value={selectedDevice.customer_id ? 'Tilknyttet' : 'Uassignet'}
                      sublabel={selectedDevice.customer_id ? 'Aktiv' : 'For testing'}
                      color={selectedDevice.customer_id ? '#22c55e' : '#f59e0b'}
                    />
                  </div>

                  {/* Posisjon på kart-lenke */}
                  {selectedDevice.last_latitude && selectedDevice.last_longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedDevice.last_latitude},${selectedDevice.last_longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: 16,
                        padding: '10px 16px',
                        background: '#0a2a3d',
                        color: 'white',
                        borderRadius: 8,
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      🗺️ Vis posisjon på kart
                    </a>
                  )}

                  {selectedDevice.notes && (
                    <div style={{
                      marginTop: 16,
                      padding: 12,
                      background: '#f0f7fa',
                      borderRadius: 8,
                      fontSize: 13,
                      color: '#6b8fa3',
                    }}>
                      💬 {selectedDevice.notes}
                    </div>
                  )}
                </div>

                {/* Kommando-panel */}
                <div style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid rgba(10,42,61,0.08)',
                }}>
                  <h3 style={{
                    fontSize: 16,
                    margin: 0,
                    marginBottom: 4,
                  }}>
                    Fjernstyr enhet
                  </h3>
                  <p style={{
                    fontSize: 13,
                    color: '#6b8fa3',
                    marginTop: 0,
                    marginBottom: 16,
                  }}>
                    Send kommandoer til enheten over åpen TCP-tilkobling. Krever at enheten er online.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 10,
                    marginBottom: 20,
                  }}>
                    <CommandButton
                      emoji="📍"
                      label="Be om posisjon"
                      description="Tving rapport NÅ"
                      command="WHERE"
                      sendingCommand={sendingCommand}
                      onSend={sendCommand}
                    />
                    <CommandButton
                      emoji="🔔"
                      label="Pip (RING)"
                      description="Skru på summer"
                      command="RING,ON"
                      sendingCommand={sendingCommand}
                      onSend={sendCommand}
                    />
                    <CommandButton
                      emoji="🔧"
                      label="Les konfig"
                      description="Hent alle innstillinger"
                      command="RCONF"
                      sendingCommand={sendingCommand}
                      onSend={sendCommand}
                    />
                    <CommandButton
                      emoji="🔄"
                      label="Restart"
                      description="Restart enheten"
                      command="RST"
                      sendingCommand={sendingCommand}
                      onSend={sendCommand}
                      confirm
                    />
                  </div>

                  {/* Kommando-historikk */}
                  {commands.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: 12,
                        color: '#6b8fa3',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                      }}>
                        Siste kommandoer
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        maxHeight: 280,
                        overflowY: 'auto',
                      }}>
                        {commands.slice(0, 10).map((c) => (
                          <CommandHistoryRow key={c.id} cmd={c} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Event-historikk */}
                <div style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid rgba(10,42,61,0.08)',
                }}>
                  <h3 style={{
                    fontSize: 16,
                    margin: 0,
                    marginBottom: 16,
                  }}>
                    Siste hendelser
                  </h3>

                  {deviceEvents.length === 0 ? (
                    <div style={{
                      color: '#6b8fa3',
                      fontSize: 14,
                      padding: '20px 0',
                      textAlign: 'center',
                    }}>
                      Ingen hendelser ennå
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}>
                      {deviceEvents.map((e) => {
                        const info = STATUS_LABELS[e.status_type] || {
                          label: e.status,
                          color: '#6b8fa3',
                          emoji: '·',
                        }
                        return (
                          <div
                            key={e.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '32px 1fr auto auto',
                              gap: 12,
                              alignItems: 'center',
                              padding: '12px 14px',
                              background: e.is_critical ? '#fef2f2' : '#f9fafb',
                              borderRadius: 8,
                              border: e.is_critical ? '1px solid #fecaca' : 'none',
                              fontSize: 13,
                            }}
                          >
                            <div style={{ fontSize: 18 }}>{info.emoji}</div>
                            <div>
                              <div style={{
                                fontWeight: 600,
                                color: info.color,
                              }}>
                                {info.label}
                              </div>
                              {e.gps_valid && e.latitude && e.longitude && (
                                <div style={{
                                  fontSize: 11,
                                  color: '#6b8fa3',
                                  fontFamily: 'monospace',
                                  marginTop: 2,
                                }}>
                                  {e.latitude.toFixed(4)}, {e.longitude.toFixed(4)}
                                  {e.speed_kmh ? ` · ${e.speed_kmh.toFixed(1)} km/t` : ''}
                                </div>
                              )}
                            </div>
                            <div style={{
                              fontSize: 12,
                              color: voltageColor(e.backup_voltage),
                              fontWeight: 600,
                            }}>
                              {e.backup_voltage ? `${voltagePercent(e.backup_voltage)}%` : ''}
                            </div>
                            <div style={{
                              fontSize: 12,
                              color: '#6b8fa3',
                              fontFamily: 'monospace',
                            }}>
                              {timeAgo(e.received_at)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  sublabel,
  color = '#0a2a3d',
}: {
  label: string
  value: string
  sublabel?: string
  color?: string
}) {
  return (
    <div>
      <div style={{
        fontSize: 11,
        color: '#6b8fa3',
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 22,
        fontWeight: 700,
        color,
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      {sublabel && (
        <div style={{
          fontSize: 12,
          color: '#6b8fa3',
          marginTop: 2,
        }}>
          {sublabel}
        </div>
      )}
    </div>
  )
}

function CommandButton({
  emoji,
  label,
  description,
  command,
  sendingCommand,
  onSend,
  confirm = false,
}: {
  emoji: string
  label: string
  description: string
  command: string
  sendingCommand: string | null
  onSend: (cmd: string) => void
  confirm?: boolean
}) {
  const isSending = sendingCommand === command
  const handleClick = () => {
    if (confirm && !window.confirm(`Sikker på at du vil sende "${command}" til enheten?`)) {
      return
    }
    onSend(command)
  }
  return (
    <button
      onClick={handleClick}
      disabled={isSending}
      style={{
        background: isSending ? '#22c55e' : 'white',
        color: isSending ? 'white' : '#0a2a3d',
        border: '1px solid ' + (isSending ? '#22c55e' : 'rgba(10,42,61,0.15)'),
        borderRadius: 10,
        padding: '12px 14px',
        cursor: isSending ? 'wait' : 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
        opacity: isSending ? 0.85 : 1,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
      }}>
        <span style={{ fontSize: 18 }}>{isSending ? '⏳' : emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {isSending ? 'Sender...' : label}
        </span>
      </div>
      <div style={{
        fontSize: 11,
        color: isSending ? 'rgba(255,255,255,0.85)' : '#6b8fa3',
        marginLeft: 26,
      }}>
        {description} · <code style={{ fontFamily: 'monospace', fontSize: 10 }}>{command}</code>
      </div>
    </button>
  )
}

const COMMAND_STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  pending: { bg: '#fef3c7', fg: '#92400e', label: 'Venter' },
  sent: { bg: '#dbeafe', fg: '#1e40af', label: 'Sendt' },
  acknowledged: { bg: '#dcfce7', fg: '#166534', label: 'Bekreftet' },
  failed: { bg: '#fee2e2', fg: '#991b1b', label: 'Feilet' },
  timeout: { bg: '#f3f4f6', fg: '#6b7280', label: 'Timeout' },
  cancelled: { bg: '#f3f4f6', fg: '#6b7280', label: 'Avbrutt' },
}

function CommandHistoryRow({ cmd }: { cmd: TrackerCommand }) {
  const status = COMMAND_STATUS_COLORS[cmd.status] ?? COMMAND_STATUS_COLORS.pending
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: 12,
      alignItems: 'center',
      padding: '10px 12px',
      background: '#f9fafb',
      borderRadius: 8,
      fontSize: 13,
    }}>
      <div>
        <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{cmd.command}</div>
        {cmd.payload?.description && (
          <div style={{ fontSize: 11, color: '#6b8fa3', marginTop: 2 }}>
            {cmd.payload.description}
          </div>
        )}
        {cmd.response && (
          <div style={{
            fontSize: 11,
            color: '#22c55e',
            fontFamily: 'monospace',
            marginTop: 2,
          }}>
            ← {cmd.response}
          </div>
        )}
      </div>
      <div style={{
        background: status.bg,
        color: status.fg,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
      }}>
        {status.label}
      </div>
      <div style={{ fontSize: 11, color: '#6b8fa3', fontFamily: 'monospace' }}>
        {timeAgo(cmd.created_at)}
      </div>
    </div>
  )
}
