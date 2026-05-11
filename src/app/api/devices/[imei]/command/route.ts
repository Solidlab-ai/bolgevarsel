import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/devices/[imei]/command
 *
 * Legger en kommando i Supabase-køen. Tracker-serveren (Railway)
 * poller køen hvert 5. sekund og sender kommandoer til tilkoblede enheter.
 *
 * Foreløpig: åpent endepunkt (samme som dashboardet).
 * TODO: legg til admin-auth når dashboardet får det.
 */

const ALLOWED_COMMANDS: Record<string, { type: string; description: string }> = {
  'WHERE': { type: 'position', description: 'Be om umiddelbar posisjonsrapport' },
  'CR': { type: 'position', description: 'Tving rapport NÅ' },
  'RING,ON': { type: 'ring', description: 'Skru på summer (finn enhet)' },
  'RING,OFF': { type: 'ring', description: 'Skru av summer' },
  'BUZ,ON': { type: 'ring', description: 'Aktiver buzzer' },
  'BUZ,OFF': { type: 'ring', description: 'Deaktiver buzzer' },
  'RST': { type: 'restart', description: 'Restart enhet' },
  'RCONF': { type: 'config_read', description: 'Les hele konfigurasjonen' },
  'SOS,ON': { type: 'config_write', description: 'Aktiver SOS-knapp' },
  'SOS,OFF': { type: 'config_write', description: 'Deaktiver SOS-knapp' },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ imei: string }> }
) {
  const { imei } = await params;

  let body: { command?: string; commandType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ugyldig JSON' }, { status: 400 });
  }

  const command = body.command?.trim().toUpperCase();
  if (!command) {
    return NextResponse.json({ error: 'command kreves' }, { status: 400 });
  }

  const allowedCmd = ALLOWED_COMMANDS[command];
  if (!allowedCmd) {
    return NextResponse.json(
      {
        error: `Kommando "${command}" er ikke tillatt.`,
        allowed: Object.keys(ALLOWED_COMMANDS),
      },
      { status: 400 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: device, error: deviceErr } = await supabase
    .from('bolgevarsel_devices')
    .select('imei, customer_id, name')
    .eq('imei', imei)
    .single();

  if (deviceErr || !device) {
    return NextResponse.json({ error: 'Enhet ikke funnet' }, { status: 404 });
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('bolgevarsel_tracker_commands')
    .insert({
      imei,
      command,
      command_type: body.commandType ?? allowedCmd.type,
      requested_by: 'dashboard',
      payload: { description: allowedCmd.description },
    })
    .select('id, status, created_at, expires_at')
    .single();

  if (insertErr || !inserted) {
    console.error('Klarte ikke å legge kommando i kø:', insertErr);
    return NextResponse.json(
      { error: 'Klarte ikke å legge kommando i kø' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: inserted.id,
    command,
    description: allowedCmd.description,
    status: inserted.status,
    createdAt: inserted.created_at,
    expiresAt: inserted.expires_at,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ imei: string }> }
) {
  const { imei } = await params;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const cmdId = req.nextUrl.searchParams.get('id');

  if (cmdId) {
    const { data, error } = await supabase
      .from('bolgevarsel_tracker_commands')
      .select('*')
      .eq('imei', imei)
      .eq('id', parseInt(cmdId, 10))
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Kommando ikke funnet' }, { status: 404 });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('bolgevarsel_tracker_commands')
    .select('*')
    .eq('imei', imei)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ commands: data ?? [] });
}
