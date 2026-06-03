'use client';

/**
 * ResultCard — one search hit, rendered as a tappable card.
 *
 *  - Bold, prominent price ("ETB 500.00")
 *  - Brand name + generic name
 *  - Pharmacy name + sub-city badge
 *  - Distance badge (colour-coded)
 *  - Stock count (small "X in stock" line)
 *  - **Direct tap-to-call button** (`tel:` link) — the killer feature
 *
 * Mobile-first: price stacks above the meta on small screens and
 * sits in a header row on tablet+.
 */

import { Building2, Navigation, Phone, Pill, Tag } from 'lucide-react';
import { DistanceBadge } from './DistanceBadge';
import { cn, formatEtbShort, telHref } from '@/lib/utils/format';
import { mapsUrl } from '@/lib/utils/geo';
import type { MedicineSearchResult } from '@/lib/types';

interface ResultCardProps {
    result: MedicineSearchResult;
}

export function ResultCard({ result }: ResultCardProps) {
    const callHref = telHref(result.phone);
    const mapHref = mapsUrl(result.latitude, result.longitude, result.pharmacyName);

    return (
        <article
            className={cn(
                'group flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition',
                'hover:shadow-md hover:ring-emerald-200 sm:p-5'
            )}
        >
            {/* ---- Top row: medicine + price --------------------- */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Pill className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                            {result.brandName}
                        </h3>
                        <p className="truncate text-xs text-slate-500 sm:text-sm">
                            {result.genericName}
                            {result.manufacturer ? ` · ${result.manufacturer}` : ''}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-400">
                            <Tag className="h-3 w-3" />
                            {result.category}
                        </p>
                    </div>
                </div>

                <div className="shrink-0 text-right">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Price
                    </p>
                    <p className="text-2xl font-bold leading-none text-emerald-700 sm:text-3xl">
                        {formatEtbShort(result.priceEtb)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">per unit · ETB</p>
                </div>
            </div>

            {/* ---- Middle row: pharmacy + location badges -------- */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    <Building2 className="h-3 w-3" />
                    {result.pharmacyName}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    <Navigation className="h-3 w-3" />
                    {result.subCity}
                    {result.woreda ? ` · ${result.woreda}` : ''}
                </span>
                <DistanceBadge km={result.distanceKm} />
            </div>

            {/* ---- Stock line ----------------------------------- */}
            <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                    {result.stockQuantity}
                </span>{' '}
                {result.stockQuantity === 1 ? 'unit' : 'units'} in stock · batch{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700">
                    {result.batchNumber}
                </code>
            </p>

            {/* ---- Action row: directions + call ---------------- */}
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row">
                <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition',
                        'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    )}
                >
                    <Navigation className="h-4 w-4" />
                    Directions
                </a>
                <a
                    href={callHref}
                    aria-label={`Call ${result.pharmacyName} at ${result.phone}`}
                    className={cn(
                        'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition',
                        'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
                    )}
                >
                    <Phone className="h-4 w-4" />
                    Call {result.phone}
                </a>
            </div>
        </article>
    );
}
